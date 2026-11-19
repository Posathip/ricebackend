import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateStaffDto } from 'src/dto/user.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { StaffSummary, UserService } from './user.service';

@ApiTags('Staff')
@ApiBearerAuth()
@Controller('staff')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all staff (first name only)' })
  @ApiResponse({ status: 200, description: 'Staff list' })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  @Get('getdata')
  getAllStaff(): Promise<StaffSummary[]> {
    return this.userService.getAllStaff();
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create multiple staff' })
  @ApiBody({ type: [CreateStaffDto] })
  @ApiResponse({ status: 200, description: 'Staff created' })
  @Post('postdata')
  createManyStaff(@Body() dtoList: CreateStaffDto[]): Promise<{ message: string }> {
    return this.userService.createManyStaff(dtoList);
  }
}
