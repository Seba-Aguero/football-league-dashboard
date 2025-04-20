import { Match } from './match.interface';

export interface AccessTokenResponse {
  access_token: string;
}

export interface MatchesResponse {
  matches: Match[];
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}