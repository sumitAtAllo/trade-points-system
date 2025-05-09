import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LeaderboardType } from './entities/leaderboard-type.entity';
import { LeaderboardEntry, LeaderboardPeriod } from './entities/leaderboard-entry.entity';
import { CreateLeaderboardTypeDto } from './dto/create-leaderboard-type.dto';
import { UpdateLeaderboardTypeDto } from './dto/update-leaderboard-type.dto';
import { GetLeaderboardDto } from './dto/get-leaderboard.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LeaderboardsService {
  constructor(
    @InjectRepository(LeaderboardType)
    private leaderboardTypeRepository: Repository<LeaderboardType>,
    @InjectRepository(LeaderboardEntry)
    private leaderboardEntryRepository: Repository<LeaderboardEntry>,
    private dataSource: DataSource,
  ) {}

  async createLeaderboardType(createLeaderboardTypeDto: CreateLeaderboardTypeDto): Promise<LeaderboardType> {
    const leaderboardType = this.leaderboardTypeRepository.create(createLeaderboardTypeDto);
    return this.leaderboardTypeRepository.save(leaderboardType);
  }

  async findAllLeaderboardTypes(): Promise<LeaderboardType[]> {
    return this.leaderboardTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findLeaderboardTypeById(id: string): Promise<LeaderboardType> {
    const leaderboardType = await this.leaderboardTypeRepository.findOne({
      where: { id },
    });
    
    if (!leaderboardType) {
      throw new NotFoundException(`Leaderboard type with ID ${id} not found`);
    }
    
    return leaderboardType;
  }

  async updateLeaderboardType(id: string, updateLeaderboardTypeDto: UpdateLeaderboardTypeDto): Promise<LeaderboardType> {
    const leaderboardType = await this.findLeaderboardTypeById(id);
    Object.assign(leaderboardType, updateLeaderboardTypeDto);
    return this.leaderboardTypeRepository.save(leaderboardType);
  }

  async deleteLeaderboardType(id: string): Promise<void> {
    const result = await this.leaderboardTypeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Leaderboard type with ID ${id} not found`);
    }
  }

  async getLeaderboard(getLeaderboardDto: GetLeaderboardDto): Promise<LeaderboardEntry[]> {
    const { leaderboardTypeId, period, limit = 100 } = getLeaderboardDto;

    // Validate leaderboard type exists
    await this.findLeaderboardTypeById(leaderboardTypeId);

    // Calculate date range
    const { startDate, endDate } = this.calculateDateRange(period);

    return this.leaderboardEntryRepository.find({
      where: {
        leaderboardTypeId,
        period,
        periodStartDate: startDate,
        periodEndDate: endDate,
      },
      relations: ['user'],
      order: { rank: 'ASC' },
      take: limit,
    });
  }

  async getUserRank(userId: string, leaderboardTypeId: string, period: LeaderboardPeriod): Promise<{ 
    rank: number; 
    score: number; 
    totalParticipants: number; 
  }> {
    // Calculate date range
    const { startDate, endDate } = this.calculateDateRange(period);

    // Find user's leaderboard entry
    const entry = await this.leaderboardEntryRepository.findOne({
      where: {
        userId,
        leaderboardTypeId,
        period,
        periodStartDate: startDate,
        periodEndDate: endDate,
      },
    });

    if (!entry) {
      return {
        rank: 0,
        score: 0,
        totalParticipants: await this.leaderboardEntryRepository.count({
          where: {
            leaderboardTypeId,
            period,
            periodStartDate: startDate,
            periodEndDate: endDate,
          },
        }),
      };
    }

    return {
      rank: entry.rank || 0,
      score: entry.score,
      totalParticipants: await this.leaderboardEntryRepository.count({
        where: {
          leaderboardTypeId,
          period,
          periodStartDate: startDate,
          periodEndDate: endDate,
        },
      }),
    };
  }

  private calculateDateRange(period: LeaderboardPeriod): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    switch (period) {
      case LeaderboardPeriod.DAILY:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        break;
      case LeaderboardPeriod.WEEKLY:
        // Start date is the previous Monday (or today if it's Monday)
        const dayOfWeek = now.getDay() || 7; // Convert Sunday (0) to 7
        const diff = dayOfWeek - 1; // Monday is 1
        startDate = new Date(now);
        startDate.setDate(now.getDate() - diff);
        startDate.setHours(0, 0, 0, 0);
        break;
      case LeaderboardPeriod.MONTHLY:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        break;
      case LeaderboardPeriod.ALL_TIME:
        startDate = new Date(2000, 0, 1, 0, 0, 0, 0); // Far past date
        break;
      default:
        throw new BadRequestException('Invalid leaderboard period');
    }

    return { startDate, endDate };
  }

  /**
   * Update leaderboards based on user points.
   * This method is scheduled to run at specific intervals.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async updatePointsLeaderboards() {
    // Get points leaderboard type (create if it doesn't exist)
    let pointsLeaderboardType = await this.leaderboardTypeRepository.findOne({
      where: { name: 'Points' },
    });

    if (!pointsLeaderboardType) {
      pointsLeaderboardType = await this.createLeaderboardType({
        name: 'Points',
        description: 'Leaderboard based on total points accumulated',
        isActive: true,
      });
    }

    // Update leaderboards for all periods
    await this.updateLeaderboardForPeriod(pointsLeaderboardType.id, LeaderboardPeriod.DAILY);
    await this.updateLeaderboardForPeriod(pointsLeaderboardType.id, LeaderboardPeriod.WEEKLY);
    await this.updateLeaderboardForPeriod(pointsLeaderboardType.id, LeaderboardPeriod.MONTHLY);
    await this.updateLeaderboardForPeriod(pointsLeaderboardType.id, LeaderboardPeriod.ALL_TIME);
  }

  /**
   * Update trade volume leaderboards.
   * This method is scheduled to run at specific intervals.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async updateTradeVolumeLeaderboards() {
    // Get trade volume leaderboard type (create if it doesn't exist)
    let tradeVolumeLeaderboardType = await this.leaderboardTypeRepository.findOne({
      where: { name: 'Trade Volume' },
    });

    if (!tradeVolumeLeaderboardType) {
      tradeVolumeLeaderboardType = await this.createLeaderboardType({
        name: 'Trade Volume',
        description: 'Leaderboard based on total trade volume',
        isActive: true,
      });
    }

    // Update leaderboards for all periods
    await this.updateTradeVolumeLeaderboardForPeriod(tradeVolumeLeaderboardType.id, LeaderboardPeriod.DAILY);
    await this.updateTradeVolumeLeaderboardForPeriod(tradeVolumeLeaderboardType.id, LeaderboardPeriod.WEEKLY);
    await this.updateTradeVolumeLeaderboardForPeriod(tradeVolumeLeaderboardType.id, LeaderboardPeriod.MONTHLY);
    await this.updateTradeVolumeLeaderboardForPeriod(tradeVolumeLeaderboardType.id, LeaderboardPeriod.ALL_TIME);
  }

  /**
   * Update the leaderboard for a specific period based on user points.
   */
  private async updateLeaderboardForPeriod(leaderboardTypeId: string, period: LeaderboardPeriod): Promise<void> {
    const { startDate, endDate } = this.calculateDateRange(period);

    // Clear existing entries for the period
    await this.leaderboardEntryRepository.delete({
      leaderboardTypeId,
      period,
      periodStartDate: startDate,
      periodEndDate: endDate,
    });

    // Get points earned during the period
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Query to get user points for the period
      const pointsQuery = queryRunner.manager
        .createQueryBuilder()
        .select('pl.user_id', 'userId')
        .addSelect('SUM(pl.points_amount)', 'totalPoints')
        .from('points_ledger', 'pl')
        .where('pl.created_at >= :startDate', { startDate })
        .andWhere('pl.created_at <= :endDate', { endDate })
        .andWhere('pl.transaction_type = :transactionType', { transactionType: 'EARNED' })
        .groupBy('pl.user_id')
        .orderBy('totalPoints', 'DESC');

      const pointsResults = await pointsQuery.getRawMany();

      // Create new leaderboard entries
      let rank = 1;
      for (const result of pointsResults) {
        if (result.totalPoints > 0) {
          const entry = this.leaderboardEntryRepository.create({
            leaderboardTypeId,
            userId: result.userId,
            period,
            periodStartDate: startDate,
            periodEndDate: endDate,
            score: parseFloat(result.totalPoints),
            rank,
          });

          await queryRunner.manager.save(entry);
          rank++;
        }
      }
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update the trade volume leaderboard for a specific period.
   */
  private async updateTradeVolumeLeaderboardForPeriod(leaderboardTypeId: string, period: LeaderboardPeriod): Promise<void> {
    const { startDate, endDate } = this.calculateDateRange(period);

    // Clear existing entries for the period
    await this.leaderboardEntryRepository.delete({
      leaderboardTypeId,
      period,
      periodStartDate: startDate,
      periodEndDate: endDate,
    });

    // Get trade volume during the period
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Query to get user trade volume for the period
      const volumeQuery = queryRunner.manager
        .createQueryBuilder()
        .select('t.user_id', 'userId')
        .addSelect('SUM(t.total_amount)', 'totalVolume')
        .from('trades', 't')
        .where('t.created_at >= :startDate', { startDate })
        .andWhere('t.created_at <= :endDate', { endDate })
        .andWhere('t.status = :status', { status: 'COMPLETED' })
        .groupBy('t.user_id')
        .orderBy('totalVolume', 'DESC');

      const volumeResults = await volumeQuery.getRawMany();

      // Create new leaderboard entries
      let rank = 1;
      for (const result of volumeResults) {
        if (result.totalVolume > 0) {
          const entry = this.leaderboardEntryRepository.create({
            leaderboardTypeId,
            userId: result.userId,
            period,
            periodStartDate: startDate,
            periodEndDate: endDate,
            score: parseFloat(result.totalVolume),
            rank,
          });

          await queryRunner.manager.save(entry);
          rank++;
        }
      }
    } finally {
      await queryRunner.release();
    }
  }
}