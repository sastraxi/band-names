import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WordFrequencyService } from './services/frequency.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, WordFrequencyService],
})
export class AppModule {}
