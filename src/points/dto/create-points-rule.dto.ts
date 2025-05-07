import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePointsRuleDto {
  @IsString()
  @IsNotEmpty()
  ruleName: string;

  @IsString()
  @IsNotEmpty()
  ruleType: string;

  @IsNumber()
  @IsNotEmpty()
  pointsValue: number;

  @IsNumber()
  @IsOptional()
  minValue?: number;

  @IsNumber()
  @IsOptional()
  maxValue?: number;

  @IsBoolean()
  @IsOptional()
  isPercentage?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
