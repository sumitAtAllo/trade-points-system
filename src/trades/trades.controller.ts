import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { TradesService } from './trades.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('trades')
@Controller('trades')
// @UseGuards(JwtAuthGuard) // uncomment this line when auth module is implemented
@ApiBearerAuth()
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trade' })
  @ApiResponse({ status: 201, description: 'Trade created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Request() req, @Body() createTradeDto: CreateTradeDto) {
    return this.tradesService.create(req.user.id, createTradeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trades for the current user' })
  @ApiResponse({ status: 200, description: 'Returns all trades.' })
  async findAll(@Request() req) {
    return this.tradesService.findAllByUserId(req.user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get trade summary for the current user' })
  @ApiResponse({ status: 200, description: 'Returns the trade summary.' })
  async getTradeSummary(@Request() req) {
    return this.tradesService.getTradeSummaryByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific trade by ID' })
  @ApiResponse({ status: 200, description: 'Returns the trade.' })
  @ApiResponse({ status: 404, description: 'Trade not found.' })
  async findOne(@Param('id') id: string) {
    return this.tradesService.findOne(id);
  }
}