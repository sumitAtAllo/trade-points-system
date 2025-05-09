import { PartialType } from '@nestjs/swagger';
import { CreateLeaderboardTypeDto } from './create-leaderboard-type.dto';

export class UpdateLeaderboardTypeDto extends PartialType(CreateLeaderboardTypeDto) {}
