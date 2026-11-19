import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { rethrowAsHttpException } from 'src/common/service-error';
import { CreateAccountUser, LoginDTO } from 'src/dto/user.dto';
import { PrismaService } from '../../prisma/prisma.service';

const FALLBACK_DEFAULT_PASSWORD = 'Demoadmin';

interface AccessTokenPayload {
  id: string;
  email: string;
  roleUserLevel: string;
}

interface RefreshTokenPayload {
  id: string;
  email: string;
}

export interface SignInResult {
  message: string;
  accessTokentime: Date;
  accessToken: string;
  refreshToken: string;
  refreshTokentime: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createAccountUser(dto: CreateAccountUser): Promise<{ message: string }> {
    console.log('[AuthService.createAccountUser] email:', dto.email);
    try {
      const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existingUser) throw new BadRequestException('Email already exist');

      const defaultPassword = this.configService.get<string>('DEFAULT_PASSWORD', FALLBACK_DEFAULT_PASSWORD);
      const hashedPassword = await this.hashPassword(defaultPassword);

      await this.prisma.user.create({
        data: {
          email: dto.email,
          // `password` is @unique in the schema; store the (salted, therefore unique) hash
          // instead of the shared plaintext default password.
          password: hashedPassword,
          hashpassword: hashedPassword,
          roleUserLevel: dto.roleUserLevel,
        },
      });

      console.log('[AuthService.createAccountUser] result created:', dto.email);
      return { message: `Create account email: ${dto.email}  complete` };
    } catch (error) {
      rethrowAsHttpException('AuthService.createAccountUser', error);
    }
  }

  async signIn(dto: LoginDTO): Promise<SignInResult> {
    console.log('[AuthService.signIn] email:', dto.email);
    try {
      const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (!user) throw new BadRequestException('No email in database');

      const isPasswordMatch = await this.comparePasswords(dto.password, user.hashpassword);
      if (!isPasswordMatch) throw new BadRequestException('Password are not correct');

      const accessToken = await this.signAccessToken({
        id: user.id,
        email: user.email,
        roleUserLevel: user.roleUserLevel,
      });
      if (!accessToken) throw new ForbiddenException();

      const refreshToken = await this.signRefreshToken({ id: user.id, email: user.email });

      const now = Date.now();
      const result: SignInResult = {
        message: 'Logged in sucessfully',
        accessTokentime: new Date(now + this.getConfigNumber('ACCESS_TOKEN_AGE_MS')),
        accessToken,
        refreshToken,
        refreshTokentime: new Date(now + this.getConfigNumber('REFRESH_TOKEN_AGE_MS')),
      };
      console.log('[AuthService.signIn] result: login success', dto.email);
      return result;
    } catch (error) {
      rethrowAsHttpException('AuthService.signIn', error);
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.getConfigNumber('BCRYPT_SALT_ROUNDS'));
  }

  private async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private async signAccessToken(payload: AccessTokenPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRY'),
    });
  }

  private async signRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRY'),
    });
  }

  private getConfigNumber(key: string): number {
    return Number(this.configService.get<string>(key));
  }
}
