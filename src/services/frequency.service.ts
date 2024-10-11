import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';
import axios from 'axios';
import * as zlib from 'zlib';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WordFrequency } from '../entities/word-frequency.entity';
import { ProcessedFile } from '../entities/processed-file.entity';

const DATASET_BASE_NAME = 'googlebooks-eng-fiction-all-1gram-20120701-';

// https://storage.googleapis.com/books/ngrams/books/datasetsv3.html

const MAX_POSTGRES_INT = 2147483647;

@Injectable()
export class WordFrequencyService {
  private readonly logger = new Logger(WordFrequencyService.name);
  private readonly datasetDir = path.join(__dirname, '..', '..', 'data');
  private readonly datasetBaseUrl = `http://storage.googleapis.com/books/ngrams/books/${DATASET_BASE_NAME}`;

  constructor(
    @InjectRepository(WordFrequency)
    private wordFrequencyRepository: Repository<WordFrequency>,
    @InjectRepository(ProcessedFile)
    private processedFileRepository: Repository<ProcessedFile>
  ) {
    this.ensureDataDirectoryExists();
  }

  private ensureDataDirectoryExists(): void {
    if (!fs.existsSync(this.datasetDir)) {
      fs.mkdirSync(this.datasetDir, { recursive: true });
      this.logger.log(`Created directory: ${this.datasetDir}`);
    }
  }

  async computeMostFrequentWords(limit: number = 1000): Promise<string[]> {
    return this.getTopWords(limit);
  }

  async processDataset(minFrequency: number = 10000, batchSize: number = 50): Promise<void> {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    
    for (const letter of letters) {
      const filename = `${DATASET_BASE_NAME}${letter}`;
      const filePath = path.join(this.datasetDir, filename);
      
      // Check if the file has already been processed
      const processedFile = await this.processedFileRepository.findOne({ where: { filename } });
      if (processedFile) {
        this.logger.log(`File ${filename} has already been processed. Skipping.`);
        continue;
      }

      // Download the file if it doesn't exist
      if (!fs.existsSync(filePath)) {
        await this.downloadFile(letter);
      }

      this.logger.log(`Processing file: ${filename}`);

      const fileStream = fs.createReadStream(filePath);
      const gunzip = zlib.createGunzip();
      const rl = readline.createInterface({
        input: fileStream.pipe(gunzip),
        crlfDelay: Infinity,
      });

      let newEntriesCount = 0;
      const wordFrequencies: { [key: string]: number } = {};

      for await (const line of rl) {
        const [word, , count] = line.split('\t');
        const frequency = parseInt(count, 10);

        if (this.isValidWord(word)) {
          const lowercaseWord = word.toLowerCase();
          if (lowercaseWord in wordFrequencies) {
            wordFrequencies[lowercaseWord] += frequency;
          } else {
            wordFrequencies[lowercaseWord] = frequency;
          }
        }
      }

      // Process accumulated word frequencies in batches
      const entries = Object.entries(wordFrequencies)
        .filter(([, totalFrequency]) => totalFrequency >= minFrequency);

      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        await this.wordFrequencyRepository.upsert(
          batch.map(([word, frequency]) => ({
            word,
            frequency: Math.min(frequency, MAX_POSTGRES_INT)
          })),
          { conflictPaths: ['word'] }
        );
        newEntriesCount += batch.length;
        this.logger.log(`Processed batch ${i / batchSize + 1} for ${filename}. Total entries so far: ${newEntriesCount}`);
      }

      // Mark the file as processed
      await this.processedFileRepository.save({ filename, processedAt: new Date() });

      this.logger.log(`Processed ${filename}. Added or updated ${newEntriesCount} entries.`);
    }

    this.logger.log(`Finished processing all dataset files.`);
  }

  private async getTopWords(limit: number): Promise<string[]> {
    const topWords = await this.wordFrequencyRepository.find({
      order: { frequency: 'DESC' },
      take: limit,
    });
    return topWords.map(({ word }) => word);
  }

  private async downloadFile(letter: string): Promise<void> {
    const filename = `${DATASET_BASE_NAME}${letter}`;
    const filePath = path.join(this.datasetDir, filename);
    const fileUrl = `${this.datasetBaseUrl}${letter}.gz`;

    this.logger.log(`Downloading file: ${filename}`);

    try {
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'stream',
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      this.logger.log(`File ${filename} downloaded successfully.`);
    } catch (error) {
      this.logger.error(`Error downloading file ${filename}:`, error.message);
      throw error;
    }
  }

  private isValidWord(word: string): boolean {
    return /^[a-zA-Z]+$/.test(word);
  }
}
