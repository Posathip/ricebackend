import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { CompanyService } from './company.service';
import { FastifyReply } from 'fastify';
import { CreateCompanyDto } from 'src/dto/company.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}
   @Get('getdata')
    getUserData(@Req() request: any, @Res({ passthrough: true
    }) response: FastifyReply) {
      return this.companyService.getCompanyData(request, response);
    } 
    @Post('postdata')
    postData(@Body() dto: CreateCompanyDto[], @Req() request: any, @Res({ passthrough: true }) response: FastifyReply) {
      return this.companyService.postData(dto, request, response);
    }   
}
