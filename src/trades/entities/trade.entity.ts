import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum TradeStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity('trades')
export class Trade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.trades)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'trade_type',
    type: 'enum',
    enum: TradeType,
  })
  tradeType: TradeType;

  @Column({ name: 'asset_symbol' })
  assetSymbol: string;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  quantity: number;

  @Column({ name: 'price_per_unit', type: 'decimal', precision: 20, scale: 8 })
  pricePerUnit: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 20, scale: 8 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: TradeStatus,
    default: TradeStatus.COMPLETED,
  })
  status: TradeStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
