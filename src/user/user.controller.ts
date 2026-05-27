import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { FastifyReply } from 'fastify';
import { CreateStaffDto } from 'src/dto/user.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@Controller('staff')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(JwtAuthGuard)
  @Get('getdata')
  getUserData(@Req() request: any, @Res({ passthrough: true
  }) response: FastifyReply) {
    return this.userService.getUserData(request, response);
  } 
  @UseGuards(JwtAuthGuard)
  @Post('postdata')
  postData(@Body() dto: CreateStaffDto[], @Req() request: any, @Res({ passthrough: true }) response: FastifyReply) {
    return this.userService.postData(dto, request, response);
  }   
  
}
