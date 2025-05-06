import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Trade } from '../../trades/entities/trade.entity';
import { PointsLedger } from '../../points/entities/points-ledger.entity';
import { Referral } from '../../referrals/entities/referral.entity';
import { LeaderboardEntry } from '../../leaderboards/entities/leaderboard-entry.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'referral_code', unique: true })
  referralCode: string;

  @Column({ name: 'referred_by', nullable: true })
  referredById: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'referred_by' })
  referredBy: User | null;

  @Column({ default: 0 })
  points: number;

  @OneToMany(() => Trade, (trade) => trade.user)
  trades: Trade[];

  @OneToMany(() => PointsLedger, (pointsLedger) => pointsLedger.user)
  pointsLedger: PointsLedger[];

  @OneToMany(() => Referral, (referral) => referral.referrer)
  referralsGiven: Referral[];

  @OneToMany(() => Referral, (referral) => referral.referred)
  referralsReceived: Referral[];

  @OneToMany(() => LeaderboardEntry, (leaderboardEntry) => leaderboardEntry.user)
  leaderboardEntries: LeaderboardEntry[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
