import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WordFrequency } from '../entities/word-frequency.entity';
import { Band } from '../entities/band.entity';
import { PotentialName } from '../entities/potential-name.entity';
import { SpotifyService } from './spotify.service';

@Injectable()
export class PotentialNameService {
  private readonly logger = new Logger(PotentialNameService.name);

  constructor(
    @InjectRepository(WordFrequency)
    private wordFrequencyRepository: Repository<WordFrequency>,
    @InjectRepository(Band)
    private bandRepository: Repository<Band>,
    @InjectRepository(PotentialName)
    private potentialBandNameRepository: Repository<PotentialName>,
    private spotifyService: SpotifyService
  ) {}

  async generatePotentialBandNames(limit: number): Promise<string[]> {
    try {
      const potentialNames = await this.wordFrequencyRepository
        .createQueryBuilder('wf')
        .select('wf.word')
        .leftJoin(Band, 'b', 'LOWER(wf.word) = LOWER(b.name) OR LOWER(CONCAT(\'the \', wf.word)) = LOWER(b.name)')
        .leftJoin(PotentialName, 'pn', 'wf.word = pn.word')
        .where('b.name IS NULL')
        .andWhere('pn.word IS NULL')
        .orderBy('wf.frequency', 'DESC')
        .limit(limit)
        .getMany();

      const results: Band[] = [];
      const potentials: string[] = [];

      this.logger.debug(`Generating up to ${limit} potential names...`);
      for (const potentialName of potentialNames) {
        try {
          const exactBand = await this.spotifyService.getBandWithMostListeners(
            potentialName.word,
            `the ${potentialName.word}`
          );
          
          if (exactBand) {
            results.push(exactBand);
          } else {
            await this.potentialBandNameRepository.save({ word: potentialName.word });
            potentials.push(potentialName.word);
            this.logger.debug(`+ ${potentialName.word}`);
          }
        } catch (error) {
          this.logger.error(`Error processing potential name "${potentialName.word}": ${error.message}`, error.stack);
        }
      }
      this.logger.debug(`Generated ${potentials.length} name(s).`);

      return potentials;
    } catch (error) {
      this.logger.error(`Error finding potential band names: ${error.message}`, error.stack);
      return [];
    }
  }
}
