import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { LeaderboardPeriod } from '../entities/leaderboard-entry.entity';

export class GetLeaderboardDto {
  @IsUUID()
  @IsNotEmpty()
  leaderboardTypeId: string;

  @IsEnum(LeaderboardPeriod)
  @IsNotEmpty()
  period: LeaderboardPeriod;

  @IsOptional()
  limit?: number;
}