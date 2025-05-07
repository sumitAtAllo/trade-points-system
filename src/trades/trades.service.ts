import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trade, TradeStatus, TradeType } from './entities/trade.entity';
import { CreateTradeDto } from './dto/create-trade.dto';
import { PointsService } from '../points/points.service';

@Injectable()
export class TradesService {
  constructor(
    @InjectRepository(Trade)
    private tradesRepository: Repository<Trade>,
    private pointsService: PointsService,
  ) {}

  async create(userId: string, createTradeDto: CreateTradeDto): Promise<Trade> {
    const { tradeType, assetSymbol, quantity, pricePerUnit } = createTradeDto;
    
    const totalAmount = quantity * pricePerUnit;
    
    const trade = this.tradesRepository.create({
      userId,
      tradeType,
      assetSymbol,
      quantity,
      pricePerUnit,
      totalAmount,
      status: TradeStatus.COMPLETED,
    });
    
    const savedTrade = await this.tradesRepository.save(trade);
    
    // Award points for the trade
    await this.pointsService.awardPointsForTrade(userId, savedTrade);
    
    return savedTrade;
  }

  async findAllByUserId(userId: string): Promise<Trade[]> {
    return this.tradesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Trade> {
    const trade = await this.tradesRepository.findOne({
      where: { id },
    });
    
    if (!trade) {
      throw new BadRequestException(`Trade with ID ${id} not found`);
    }
    
    return trade;
  }

  async getTradeSummaryByUser(userId: string) {
    const result = await this.tradesRepository
      .createQueryBuilder('trade')
      .select('COUNT(*)', 'totalTrades')
      .addSelect('SUM(CASE WHEN trade_type = :buyType THEN 1 ELSE 0 END)', 'buyTrades')
      .addSelect('SUM(CASE WHEN trade_type = :sellType THEN 1 ELSE 0 END)', 'sellTrades')
      .addSelect('SUM(total_amount)', 'totalVolume')
      .where('user_id = :userId', { userId })
      .setParameters({
        buyType: TradeType.BUY,
        sellType: TradeType.SELL,
      })
      .getRawOne();
    
    return {
      totalTrades: parseInt(result.totalTrades) || 0,
      buyTrades: parseInt(result.buyTrades) || 0,
      sellTrades: parseInt(result.sellTrades) || 0,
      totalVolume: parseFloat(result.totalVolume) || 0,
    };
  }
}