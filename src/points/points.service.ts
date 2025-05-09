import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PointsRule } from './entities/points-rule.entity';
import { PointsLedger, TransactionType } from './entities/points-ledger.entity';
import { CreatePointsRuleDto } from './dto/create-points-rule.dto';
import { UpdatePointsRuleDto } from './dto/update-points-rule.dto';
import { Trade } from '../trades/entities/trade.entity';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(PointsRule)
    private pointsRulesRepository: Repository<PointsRule>,
    @InjectRepository(PointsLedger)
    private pointsLedgerRepository: Repository<PointsLedger>,
    private dataSource: DataSource,
  ) {}

  async createPointsRule(createPointsRuleDto: CreatePointsRuleDto): Promise<PointsRule> {
    const pointsRule = this.pointsRulesRepository.create(createPointsRuleDto);
    return this.pointsRulesRepository.save(pointsRule);
  }

  async findAllPointsRules(): Promise<PointsRule[]> {
    return this.pointsRulesRepository.find({ where: { isActive: true } });
  }

  async findPointsRuleById(id: string): Promise<PointsRule> {
    const rule = await this.pointsRulesRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Points rule with ID ${id} not found`);
    }
    return rule;
  }

  async updatePointsRule(id: string, updatePointsRuleDto: UpdatePointsRuleDto): Promise<PointsRule> {
    const rule = await this.findPointsRuleById(id);
    Object.assign(rule, updatePointsRuleDto);
    return this.pointsRulesRepository.save(rule);
  }

  async deletePointsRule(id: string): Promise<void> {
    const result = await this.pointsRulesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Points rule with ID ${id} not found`);
    }
  }

  async getUserPointsLedger(userId: string): Promise<PointsLedger[]> {
    return this.pointsLedgerRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async awardPointsForTrade(userId: string, trade: Trade): Promise<void> {
    // Get applicable rules for trades
    const rules = await this.pointsRulesRepository.find({
      where: { ruleType: 'TRADE', isActive: true },
    });

    if (rules.length === 0) {
      return; // No active rules for trades
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalPointsAwarded = 0;

      // Process each applicable rule
      for (const rule of rules) {
        let pointsToAward = 0;

        // Check if the trade amount falls within the rule's range
        const tradeAmount = trade.totalAmount;
        const isWithinRange = 
          (rule.minValue === null || tradeAmount >= rule.minValue) && 
          (rule.maxValue === null || tradeAmount <= rule.maxValue);

        if (isWithinRange) {
          if (rule.isPercentage) {
            // Calculate points as a percentage of the trade amount
            pointsToAward = Math.floor((tradeAmount * rule.pointsValue) / 100);
          } else {
            // Fixed points amount
            pointsToAward = rule.pointsValue;
          }

          if (pointsToAward > 0) {
            // Create ledger entry
            const ledgerEntry = this.pointsLedgerRepository.create({
              userId,
              pointsAmount: pointsToAward,
              transactionType: TransactionType.EARNED,
              sourceType: 'TRADE',
              sourceId: trade.id,
              description: `Points earned for ${trade.tradeType} trade of ${trade.quantity} ${trade.assetSymbol}`,
            });

            await queryRunner.manager.save(ledgerEntry);
            totalPointsAwarded += pointsToAward;
          }
        }
      }

      // Update user's total points if any were awarded
      if (totalPointsAwarded > 0) {
        await queryRunner.manager.increment(
          'users',
          { id: userId },
          'points',
          totalPointsAwarded,
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async awardPointsForReferral(referrerId: string, referredId: string): Promise<void> {
    // Get applicable rules for referrals
    const rules = await this.pointsRulesRepository.find({
      where: { ruleType: 'REFERRAL', isActive: true },
    });

    if (rules.length === 0) {
      return; // No active rules for referrals
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Process rules for referrer
      for (const rule of rules) {
        if (rule.ruleName.includes('REFERRER')) {
          // Create ledger entry for referrer
          const referrerLedgerEntry = this.pointsLedgerRepository.create({
            userId: referrerId,
            pointsAmount: rule.pointsValue,
            transactionType: TransactionType.EARNED,
            sourceType: 'REFERRAL',
            sourceId: referredId,
            description: 'Points earned for successful referral',
          });

          await queryRunner.manager.save(referrerLedgerEntry);

          // Update referrer's total points
          await queryRunner.manager.increment(
            'users',
            { id: referrerId },
            'points',
            rule.pointsValue,
          );
        }

        if (rule.ruleName.includes('REFERRED')) {
          // Create ledger entry for referred user
          const referredLedgerEntry = this.pointsLedgerRepository.create({
            userId: referredId,
            pointsAmount: rule.pointsValue,
            transactionType: TransactionType.EARNED,
            sourceType: 'REFERRED',
            sourceId: referrerId,
            description: 'Welcome points for joining via referral',
          });

          await queryRunner.manager.save(referredLedgerEntry);

          // Update referred user's total points
          await queryRunner.manager.increment(
            'users',
            { id: referredId },
            'points',
            rule.pointsValue,
          );
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // to be implemented with user module
//   async getUserPoints(userId: string): Promise<{ totalPoints: number; history: PointsLedger[] }> {
//     const user = await this.usersService.findById(userId);
//     const history = await this.getUserPointsLedger(userId);

//     return {
//       totalPoints: user.points,
//       history,
//     };
//   }
}