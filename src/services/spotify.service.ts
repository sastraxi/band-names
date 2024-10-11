import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SpotifyService {
  private readonly logger = new Logger(SpotifyService.name);
  private accessToken: string;
  private tokenExpirationTime: number;

  constructor(private configService: ConfigService) {}

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

  async getBandWithMostListeners(bandName: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await axios.get('https://api.spotify.com/v1/search', {
        params: {
          q: bandName,
          type: 'artist',
          limit: 50 // Maximum allowed by Spotify API
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const artists = response.data.artists.items.filter(artist => 
        artist.name.toLowerCase() === bandName.toLowerCase()
      );

      if (artists.length === 0) {
        return null;
      }

      // Sort by popularity (which is related to monthly listeners) in descending order
      artists.sort((a, b) => b.popularity - a.popularity);

      // Return the most popular artist
      return artists[0];
    } catch (error) {
      this.logger.error(`Failed to fetch band information for "${bandName}"`, error);
      throw new HttpException('Failed to fetch band information from Spotify', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}