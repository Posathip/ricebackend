import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAccountUser, LoginDTO } from 'src/dto/user.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { AuthService, SignInResult } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create user account',
    description: 'สร้างบัญชีผู้ใช้ใหม่ด้วยรหัสผ่านเริ่มต้น (DEFAULT_PASSWORD)',
  })
  @ApiResponse({ status: 200, description: 'Account created' })
  @ApiResponse({ status: 400, description: 'Email already exist' })
  @Post('createaccountuser')
  createAccountUser(@Body() dto: CreateAccountUser): Promise<{ message: string }> {
    return this.authService.createAccountUser(dto);
  }

  // Public endpoint — no guard (user has no token yet)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login',
    description: 'ทำการล็อคอินโดยกรอกอีเมลและพาสเวิด',
  })
  @ApiResponse({ status: 200, description: 'Logged in sucessfully' })
  @ApiResponse({ status: 400, description: 'Email not found or password incorrect' })
  @Post('login')
  signIn(@Body() dto: LoginDTO): Promise<SignInResult> {
    return this.authService.signIn(dto);
  }
}
