import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { LeaderboardsService } from './leaderboards.service';
import { CreateLeaderboardTypeDto } from './dto/create-leaderboard-type.dto';
import { UpdateLeaderboardTypeDto } from './dto/update-leaderboard-type.dto';
import { GetLeaderboardDto } from './dto/get-leaderboard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LeaderboardPeriod } from './entities/leaderboard-entry.entity';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('leaderboards')
@Controller('leaderboards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Post('types')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new leaderboard type' })
  @ApiResponse({ status: 201, description: 'The leaderboard type has been successfully created.' })
  createLeaderboardType(@Body() createLeaderboardTypeDto: CreateLeaderboardTypeDto) {
    return this.leaderboardsService.createLeaderboardType(createLeaderboardTypeDto);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all leaderboard types' })
  @ApiResponse({ status: 200, description: 'Returns all leaderboard types.' })
  findAllLeaderboardTypes() {
    return this.leaderboardsService.findAllLeaderboardTypes();
  }

  @Get('types/:id')
  @ApiOperation({ summary: 'Get a specific leaderboard type' })
  @ApiResponse({ status: 200, description: 'Returns the leaderboard type.' })
  @ApiResponse({ status: 404, description: 'Leaderboard type not found.' })
  findLeaderboardTypeById(@Param('id') id: string) {
    return this.leaderboardsService.findLeaderboardTypeById(id);
  }

  @Patch('types/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update a leaderboard type' })
  @ApiResponse({ status: 200, description: 'The leaderboard type has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Leaderboard type not found.' })
  updateLeaderboardType(
    @Param('id') id: string,
    @Body() updateLeaderboardTypeDto: UpdateLeaderboardTypeDto,
  ) {
    return this.leaderboardsService.updateLeaderboardType(id, updateLeaderboardTypeDto);
  }

  @Delete('types/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a leaderboard type' })
  @ApiResponse({ status: 200, description: 'The leaderboard type has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Leaderboard type not found.' })
  deleteLeaderboardType(@Param('id') id: string) {
    return this.leaderboardsService.deleteLeaderboardType(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get a specific leaderboard' })
  @ApiResponse({ status: 200, description: 'Returns the leaderboard entries.' })
  @ApiQuery({ name: 'leaderboardTypeId', required: true })
  @ApiQuery({ name: 'period', enum: LeaderboardPeriod, required: true })
  @ApiQuery({ name: 'limit', required: false })
  getLeaderboard(@Query() getLeaderboardDto: GetLeaderboardDto) {
    return this.leaderboardsService.getLeaderboard(getLeaderboardDto);
  }

  @Get('rank')
  @ApiOperation({ summary: 'Get current user rank in a specific leaderboard' })
  @ApiResponse({ status: 200, description: 'Returns the user rank information.' })
  @ApiQuery({ name: 'leaderboardTypeId', required: true })
  @ApiQuery({ name: 'period', enum: LeaderboardPeriod, required: true })
  getUserRank(
    @Request() req,
    @Query('leaderboardTypeId') leaderboardTypeId: string,
    @Query('period') period: LeaderboardPeriod,
  ) {
    return this.leaderboardsService.getUserRank(req.user.id, leaderboardTypeId, period);
  }
}
