import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { FastifyReply } from 'fastify';
import { CreateCompanyDto } from 'src/dto/company.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}
   @UseGuards(JwtAuthGuard)
   @Get('getdata')
    getUserData(@Req() request: any, @Res({ passthrough: true
    }) response: FastifyReply) {
      return this.companyService.getCompanyData(request, response);
    } 
    @UseGuards(JwtAuthGuard)
    @Post('postdata')
    postData(@Body() dto: CreateCompanyDto[], @Req() request: any, @Res({ passthrough: true }) response: FastifyReply) {
      return this.companyService.postData(dto, request, response);
    }   
}
