import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, Min } from 'class-validator';
import { TradeType } from '../entities/trade.entity';

export class CreateTradeDto {
  @IsEnum(TradeType)
  @IsNotEmpty()
  tradeType: TradeType;

  @IsString()
  @IsNotEmpty()
  assetSymbol: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  pricePerUnit: number;
}
