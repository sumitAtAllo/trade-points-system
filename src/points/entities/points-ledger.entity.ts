import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TransactionType {
  EARNED = 'EARNED',
  SPENT = 'SPENT',
  EXPIRED = 'EXPIRED',
  ADJUSTED = 'ADJUSTED',
}

@Entity('points_ledger')
export class PointsLedger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.pointsLedger)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'points_amount' })
  pointsAmount: number;

  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: TransactionType,
  })
  transactionType: TransactionType;

  @Column({ name: 'source_type' })
  sourceType: string;

  @Column({ name: 'source_id' })
  sourceId: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

