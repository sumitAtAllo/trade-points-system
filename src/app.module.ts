import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { DatabaseModule } from './config/database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TradesModule } from './trades/trades.module';
import { PointsModule } from './points/points.module';
import { ReferralsModule } from './referrals/referrals.module';
import { LeaderboardsModule } from './leaderboards/leaderboards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    TradesModule,
    PointsModule,
    ReferralsModule,
    LeaderboardsModule,
  ],
})
export class AppModule {}
