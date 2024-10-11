import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WordFrequencyService } from './services/frequency.service';
import { SpotifyService } from './services/spotify.service';
import { WordFrequency } from './entities/word-frequency.entity';
import { ProcessedFile } from './entities/processed-file.entity';
import { Band } from './entities/band.entity';
import { PotentialName } from './entities/potential-name.entity';
import { PotentialNameService } from './services/potential-name.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [WordFrequency, ProcessedFile, Band, PotentialName],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([WordFrequency, ProcessedFile, Band, PotentialName]),
  ],
  controllers: [AppController],
  providers: [AppService, WordFrequencyService, SpotifyService, PotentialNameService],
  exports: [WordFrequencyService, SpotifyService, PotentialNameService],
})
export class AppModule {}
