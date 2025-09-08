import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { FastifyReply } from 'fastify';
import { CreateStaffDto } from 'src/dto/user.dto';

@Controller('staff')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('getdata')
  getUserData(@Req() request: any, @Res({ passthrough: true
  }) response: FastifyReply) {
    return this.userService.getUserData(request, response);
  } 
  @Post('postdata')
  postData(@Body() dto: CreateStaffDto[], @Req() request: any, @Res({ passthrough: true }) response: FastifyReply) {
    return this.userService.postData(dto, request, response);
  }   
  
}
