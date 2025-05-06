import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('points_rules')
export class PointsRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'rule_name' })
  ruleName: string;

  @Column({ name: 'rule_type' })
  ruleType: string;

  @Column({ name: 'points_value' })
  pointsValue: number;

  @Column({ name: 'min_value', type: 'decimal', precision: 20, scale: 8, nullable: true })
  minValue: number | null;

  @Column({ name: 'max_value', type: 'decimal', precision: 20, scale: 8, nullable: true })
  maxValue: number | null;

  @Column({ name: 'is_percentage', default: false })
  isPercentage: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
