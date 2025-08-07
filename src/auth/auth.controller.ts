import { Body, Controller, HttpCode, Post, Req, Res,UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ApiBadGatewayResponse, ApiCreatedResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateAccountUser, LoginDTO } from 'src/dto/user.dto';

import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { FastifyReply } from 'fastify';
import { FastifyRequest } from 'fastify';

// import { AdminAuthGuard, JwtAuthGuard } from '../guards/jwt.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,private jwt: JwtService) {}
  // @UseGuards(JwtAuthGuard)
@Post('createaccountuser')
// create account

createAccountUser(
  @Body() dto: CreateAccountUser,
   @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
// ✅ ต้องมี passthrough
) {
  return this.authService.createAccountUser(dto, request, response );
}


  //  @UseGuards(JwtAuthGuard)  
@Post('login') //login
@HttpCode(200)
  @ApiOperation({
    summary: 'Login',
    description: 'ทำการล็อคอินโดยกรอกอีเมลและพาสเวิด',
  })
  @ApiCreatedResponse({
    description: 'Login Complete',
  })
  @ApiBadGatewayResponse({ description: 'User Cannot login  please try again' })
  @ApiResponse({
    status: 200,
    description: 'Logged in sucessfully',
   
  })
  signin(
    @Body() dto: LoginDTO,
 @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,

  ) {
    return this.authService.signin(dto, request, response);
  }

}
