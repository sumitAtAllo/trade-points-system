import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Referral, ReferralStatus } from './entities/referral.entity';
import { UsersService } from '../users/users.service';
import { PointsService } from '../points/points.service';
import { CreateReferralDto } from './dto/create-referral.dto';

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(Referral)
    private referralsRepository: Repository<Referral>,
    private usersService: UsersService,
    private pointsService: PointsService,
    private dataSource: DataSource,
  ) {}

  async validateReferral(userId: string, referralCode: string): Promise<void> {
    // Cannot refer oneself
    const user = await this.usersService.findById(userId);
    if (user.referralCode === referralCode) {
      throw new BadRequestException('Cannot use your own referral code');
    }

    // Check if user is already referred
    if (user.referredById) {
      throw new BadRequestException('User is already referred by someone else');
    }

    // Find referrer by referral code
    const referrer = await this.usersService.findByReferralCode(referralCode);
    if (!referrer) {
      throw new NotFoundException('Invalid referral code');
    }

    // Check if referral already exists
    const existingReferral = await this.referralsRepository.findOne({
      where: {
        referrerId: referrer.id,
        referredId: userId,
      },
    });

    if (existingReferral) {
      throw new ConflictException('Referral already exists');
    }
  }

  async createReferral(userId: string, createReferralDto: CreateReferralDto): Promise<Referral> {
    const { referralCode } = createReferralDto;

    // Validate the referral
    await this.validateReferral(userId, referralCode);

    // Find referrer by referral code
    const referrer = await this.usersService.findByReferralCode(referralCode);

    if (!referrer) {
      throw new NotFoundException('Invalid referral code');
    }

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create referral
      const referral = this.referralsRepository.create({
        referrerId: referrer.id,
        referredId: userId,
        status: ReferralStatus.COMPLETED,
        pointsAwarded: true,
      });

      // Save referral
      const savedReferral = await queryRunner.manager.save(referral);

      // Update user's referred_by
      await queryRunner.manager.update(
        'users',
        { id: userId },
        { referredById: referrer.id },
      );

      // Award points for referral
      await this.pointsService.awardPointsForReferral(referrer.id, userId);

      // Commit transaction
      await queryRunner.commitTransaction();

      return savedReferral;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async getReferralsGiven(userId: string): Promise<Referral[]> {
    return this.referralsRepository.find({
      where: { referrerId: userId },
      relations: ['referred'],
      order: { createdAt: 'DESC' },
    });
  }

  async getReferralsReceived(userId: string): Promise<Referral[]> {
    return this.referralsRepository.find({
      where: { referredId: userId },
      relations: ['referrer'],
      order: { createdAt: 'DESC' },
    });
  }

  async getReferralStats(userId: string): Promise<{
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    pointsEarned: number;
  }> {
    const referrals = await this.getReferralsGiven(userId);
    
    const totalReferrals = referrals.length;
    const completedReferrals = referrals.filter(r => r.status === ReferralStatus.COMPLETED).length;
    const pendingReferrals = referrals.filter(r => r.status === ReferralStatus.PENDING).length;
    
    // Calculate points earned from referrals
    const pointsLedgerRepo = this.dataSource.getRepository('points_ledger');
    const pointsResult = await pointsLedgerRepo
      .createQueryBuilder('points_ledger')
      .select('SUM(points_amount)', 'total')
      .where('user_id = :userId', { userId })
      .andWhere('source_type = :sourceType', { sourceType: 'REFERRAL' })
      .getRawOne();
    
    const pointsEarned = pointsResult ? parseInt(pointsResult.total) || 0 : 0;
    
    return {
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      pointsEarned,
    };
  }
}