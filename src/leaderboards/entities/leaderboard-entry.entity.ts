import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LeaderboardType } from './leaderboard-type.entity';

export enum LeaderboardPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ALL_TIME = 'ALL_TIME',
}

@Entity('leaderboard_entries')
@Unique(['leaderboardTypeId', 'userId', 'period', 'periodStartDate'])
export class LeaderboardEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'leaderboard_type_id' })
  leaderboardTypeId: string;

  @ManyToOne(() => LeaderboardType, (type) => type.entries)
  @JoinColumn({ name: 'leaderboard_type_id' })
  leaderboardType: LeaderboardType;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.leaderboardEntries)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: LeaderboardPeriod,
  })
  period: LeaderboardPeriod;

  @Column({ name: 'period_start_date', type: 'date' })
  periodStartDate: Date;

  @Column({ name: 'period_end_date', type: 'date' })
  periodEndDate: Date;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  score: number;

  @Column({ type: 'integer', nullable: true })
  rank: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
