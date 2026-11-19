import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCompanyDto } from 'src/dto/company.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { CompanyService, CompanySummary } from './company.service';

@ApiTags('Company')
@ApiBearerAuth()
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'Company list' })
  @Get('getdata')
  getAllCompanies(): Promise<CompanySummary[]> {
    return this.companyService.getAllCompanies();
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create multiple companies (duplicates skipped)' })
  @ApiBody({ type: [CreateCompanyDto] })
  @ApiResponse({ status: 200, description: 'Companies created' })
  @ApiResponse({ status: 400, description: 'No data provided' })
  @Post('postdata')
  createManyCompanies(@Body() dtoList: CreateCompanyDto[]): Promise<{ message: string }> {
    return this.companyService.createManyCompanies(dtoList);
  }
}
