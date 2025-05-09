import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('referrals')
@Controller('referrals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post()
  @ApiOperation({ summary: 'Use a referral code' })
  @ApiResponse({ status: 201, description: 'The referral has been successfully processed.' })
  @ApiResponse({ status: 400, description: 'Bad request (invalid referral).' })
  @ApiResponse({ status: 404, description: 'Referral code not found.' })
  @ApiResponse({ status: 409, description: 'Referral already exists.' })
  async createReferral(@Request() req, @Body() createReferralDto: CreateReferralDto) {
    return this.referralsService.createReferral(req.user.id, createReferralDto);
  }

  @Get('given')
  @ApiOperation({ summary: 'Get referrals given by the current user' })
  @ApiResponse({ status: 200, description: 'Returns all referrals given.' })
  async getReferralsGiven(@Request() req) {
    return this.referralsService.getReferralsGiven(req.user.id);
  }

  @Get('received')
  @ApiOperation({ summary: 'Get referrals received by the current user' })
  @ApiResponse({ status: 200, description: 'Returns all referrals received.' })
  async getReferralsReceived(@Request() req) {
    return this.referralsService.getReferralsReceived(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get referral statistics for the current user' })
  @ApiResponse({ status: 200, description: 'Returns referral statistics.' })
  async getReferralStats(@Request() req) {
    return this.referralsService.getReferralStats(req.user.id);
  }
}
