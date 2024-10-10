import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';
import axios from 'axios';
import * as zlib from 'zlib';

const DATASET_NAME = 'googlebooks-eng-all-1gram-20120701-a';

@Injectable()
export class WordFrequencyService {
  private readonly logger = new Logger(WordFrequencyService.name);
  private readonly datasetPath = path.join(__dirname, '..', '..', 'data', DATASET_NAME);
  private readonly datasetUrl = `http://storage.googleapis.com/books/ngrams/books/${DATASET_NAME}.gz`;
  private wordFrequency: Map<string, number> = new Map();

  async downloadDataset(): Promise<void> {
    const dataDir = path.dirname(this.datasetPath);

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync(this.datasetPath)) {
      this.logger.log('Dataset already exists. Skipping download.');
      return;
    }

    this.logger.log('Downloading dataset...');

    try {
      const response = await axios({
        method: 'GET',
        url: this.datasetUrl,
        responseType: 'stream',
      });

      const writer = fs.createWriteStream(this.datasetPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      this.logger.log('Dataset downloaded successfully.');
    } catch (error) {
      this.logger.error('Error downloading dataset:', error.message);
      throw error;
    }
  }

  async computeMostFrequentWords(limit: number = 1000, freq: number = 100): Promise<string[]> {
    return this.getTopWords(limit);
  }

  async processDataset(minFrequency: number = 100): Promise<void> {
    const fileStream = fs.createReadStream(this.datasetPath);
    const gunzip = zlib.createGunzip();
    const rl = readline.createInterface({
      input: fileStream.pipe(gunzip),
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      const [word, , count] = line.split('\t');
      const frequency = parseInt(count, 10);
      if (this.isValidWord(word) && frequency >= minFrequency) {
        const currentCount = this.wordFrequency.get(word) || 0;
        this.wordFrequency.set(word, currentCount + frequency);
      }
    }
  }

  private isValidWord(word: string): boolean {
    return /^[a-zA-Z]+$/.test(word);
  }

  private getTopWords(limit: number): string[] {
    const sortedWords = Array.from(this.wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
    return sortedWords.map(([word]) => word);
  }
}
