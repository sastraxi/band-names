import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import axios from 'axios';
import { Band } from '../entities/band.entity';

@Injectable()
export class SpotifyService {
  private readonly logger = new Logger(SpotifyService.name);
  private accessToken: string;
  private tokenExpirationTime: number;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Band)
    private bandRepository: Repository<Band>
  ) {}

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpirationTime) {
      return this.accessToken;
    }

    const clientId = this.configService.get<string>('SPOTIFY_CLIENT_ID');
    const clientSecret = this.configService.get<string>('SPOTIFY_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new HttpException('Spotify credentials not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpirationTime = Date.now() + (response.data.expires_in * 1000);
      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to obtain Spotify access token', error);
      throw new HttpException('Failed to authenticate with Spotify', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getBandWithMostListeners(...bandNames: string[]): Promise<Band | null> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await axios.get('https://api.spotify.com/v1/search', {
        params: {
          q: bandNames[0],
          type: 'artist',
          limit: 50 // Maximum allowed by Spotify API
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const artists = response.data.artists.items.filter(artist => 
        bandNames.some(name => name.toLowerCase() === artist.name.toLowerCase())
      );

      if (artists.length === 0) {
        return null;
      }

      // Sort by popularity (which is related to monthly listeners) in descending order
      artists.sort((a, b) => b.popularity - a.popularity);

      // Get the most popular artist
      const mostPopularArtist = artists[0];

      // Upsert the band in the database
      const band = await this.bandRepository.findOne({
        where: { 
          name: ILike(mostPopularArtist.name.trim())
        }
      });
      
      if (band) {
        // Update existing band
        band.popularity = mostPopularArtist.popularity;
        band.spotifyData = mostPopularArtist;
        band.lastUpdated = new Date();
        await this.bandRepository.save(band);
        return band;
      }
      // Create new band
      const newBand = this.bandRepository.create({
        name: mostPopularArtist.name,
        popularity: mostPopularArtist.popularity,
        spotifyData: mostPopularArtist,
      });
      await this.bandRepository.save(newBand);
      return newBand;
    } catch (error) {
      this.logger.error(`Error fetching band data for "${name}": ${error.message}`, error.stack);
      throw new HttpException('Failed to fetch band information from Spotify', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
