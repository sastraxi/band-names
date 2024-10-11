import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { AppService } from './app.service';
import { WordFrequencyService } from './services/frequency.service';
import { SpotifyService } from './services/spotify.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly wordFrequencyService: WordFrequencyService,
    private readonly spotifyService: SpotifyService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('most-frequent-words')
  async getMostFrequentWords(
    @Query('limit', new DefaultValuePipe(1000), ParseIntPipe) limit: number
  ): Promise<string[]> {
    return this.wordFrequencyService.computeMostFrequentWords(limit);
  }

  @Get('process-dataset')
  async processDataset(
    @Query('minFrequency', new DefaultValuePipe(100), ParseIntPipe) minFrequency: number
  ): Promise<string> {
    await this.wordFrequencyService.processDataset(minFrequency);
    return 'Dataset processed successfully';
  }

  @Get('band-info')
  async getBandInfo(@Query('name') bandName: string) {
    return this.spotifyService.getBandWithMostListeners(bandName);
  }
}
