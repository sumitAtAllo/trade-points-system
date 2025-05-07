import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PointsService } from './points.service';
import { CreatePointsRuleDto } from './dto/create-points-rule.dto';
import { UpdatePointsRuleDto } from './dto/update-points-rule.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('points')
@Controller('points')
// @UseGuards(JwtAuthGuard) // to-do uncomment this and similar lines when auth module is implemented
@ApiBearerAuth()
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Post('rules')
//   @UseGuards(RolesGuard)
//   @Roles('admin')
  @ApiOperation({ summary: 'Create a new points rule' })
  @ApiResponse({ status: 201, description: 'The points rule has been successfully created.' })
  createPointsRule(@Body() createPointsRuleDto: CreatePointsRuleDto) {
    return this.pointsService.createPointsRule(createPointsRuleDto);
  }

  @Get('rules')
//   @UseGuards(RolesGuard)
//   @Roles('admin')
  @ApiOperation({ summary: 'Get all points rules' })
  @ApiResponse({ status: 200, description: 'Returns all points rules.' })
  findAllPointsRules() {
    return this.pointsService.findAllPointsRules();
  }

  @Get('rules/:id')
//   @UseGuards(RolesGuard)
//   @Roles('admin')
  @ApiOperation({ summary: 'Get a specific points rule' })
  @ApiResponse({ status: 200, description: 'Returns the points rule.' })
  @ApiResponse({ status: 404, description: 'Points rule not found.' })
  findPointsRuleById(@Param('id') id: string) {
    return this.pointsService.findPointsRuleById(id);
  }

  @Patch('rules/:id')
//   @UseGuards(RolesGuard)
//   @Roles('admin')
  @ApiOperation({ summary: 'Update a points rule' })
  @ApiResponse({ status: 200, description: 'The points rule has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Points rule not found.' })
  updatePointsRule(
    @Param('id') id: string,
    @Body() updatePointsRuleDto: UpdatePointsRuleDto,
  ) {
    return this.pointsService.updatePointsRule(id, updatePointsRuleDto);
  }

  @Delete('rules/:id')
//   @UseGuards(RolesGuard)
//   @Roles('admin')
  @ApiOperation({ summary: 'Delete a points rule' })
  @ApiResponse({ status: 200, description: 'The points rule has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Points rule not found.' })
  deletePointsRule(@Param('id') id: string) {
    return this.pointsService.deletePointsRule(id);
  }

// to be implemented with user module
//   @Get()
//   @ApiOperation({ summary: 'Get current user points and history' })
//   @ApiResponse({ status: 200, description: 'Returns the user points information.' })
//   getUserPoints(@Request() req) {
//     return this.pointsService.getUserPoints(req.user.id);
//   }

  @Get('ledger')
  @ApiOperation({ summary: 'Get current user points ledger' })
  @ApiResponse({ status: 200, description: 'Returns the user points ledger.' })
  getUserPointsLedger(@Request() req) {
    return this.pointsService.getUserPointsLedger(req.user.id);
  }
}