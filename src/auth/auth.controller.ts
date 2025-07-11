import { Body, Controller, Post, Req, Res,UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ApiBadGatewayResponse, ApiCreatedResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateAccountUser, LoginDTO } from 'src/dto/user.dto';
import { Request, Response } from 'express';
// import { AdminAuthGuard, JwtAuthGuard } from '../guards/jwt.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,private jwt: JwtService) {}
  // @UseGuards(JwtAuthGuard)
@Post('createaccountuser')
// create account and sending email
@ApiOperation({
  summary: 'Create Account and Register Subscription details',
  description: 'ผู้ใช้งานทำการสมัครสมาชิก และ ลงทะเบียนข้อมูลการใช้บริการAgtechAI',
})
@ApiCreatedResponse({
  description: 'Create account email: user1@gmail.com company: CPF complete',
})

@ApiBadGatewayResponse({
  description: 'Cannot create account and register Subscription details please try again',
})
createAccountUser(
  @Body() dto: CreateAccountUser,
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response, // ✅ ต้องมี passthrough
) {
  return this.authService.createAccountUser(dto, req, res );
}


   
@Post('login') //login
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
   @Req() req: Request,
  @Res({ passthrough: true }) res: Response, 
  ) {
    return this.authService.signin(dto, req, res);
  }

}
