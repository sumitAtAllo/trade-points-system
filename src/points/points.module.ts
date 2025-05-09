import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { PointsRule } from './entities/points-rule.entity';
import { PointsLedger } from './entities/points-ledger.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PointsRule, PointsLedger]),
  ],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
