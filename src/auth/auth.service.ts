import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateAccountUser, LoginDTO } from 'src/dto/user.dto';
import { ConfigService } from '@nestjs/config';
import { FastifyReply } from 'fastify';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createAccountUser(
    dto: CreateAccountUser,
    request: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[AuthService.createAccountUser] email:', dto.email);
    try {
      const checkEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (checkEmail) {
        throw new BadRequestException('Email already exist');
      }

      const defaultPassword = this.configService.get<string>('DEFAULT_PASSWORD', 'Demoadmin');
      const hashpassword = await this.hashPassword(defaultPassword);

      await this.prisma.user.create({
        data: {
          email: dto.email,
          password: defaultPassword,
          hashpassword: hashpassword,
          roleUserLevel: dto.roleUserLevel,
        },
      });

      // console.log('[AuthService.createAccountUser] created email:', dto.email);
      return response.status(200).send({
        message: `Create account email: ${dto.email}  complete`,
      });
    } catch (error) {
      console.error('[AuthService.createAccountUser]', error);
      if (error instanceof BadRequestException) throw error;
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(message);
    }
  }

  async testsignin(dto: LoginDTO, req: Request, res: Response): Promise<void> {
    // console.log('[AuthService.testsignin] email:', dto.email);
    try {
      // console.log('[AuthService.testsignin] result: ok');
      res.status(200).send({ message: `Create account email:  complete` });
    } catch (error) {
      console.error('[AuthService.testsignin]', error);
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).send({
        message: 'Failed to create account',
        error: message,
      });
    }
  }

  async signin(
    dto: LoginDTO,
    request: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[AuthService.signin] email:', dto.email);
    try {
      const { email, password } = dto;

      const foundUser = await this.prisma.user.findUnique({
        where: { email: email },
      });

      if (!foundUser) {
        throw new BadRequestException('No email in database');
      }

      const isMatch = await this.comparePasswords({
        password,
        hash: foundUser.hashpassword,
      });

      if (!isMatch) {
        throw new BadRequestException('Password are not correct');
      }

      const token = await this.signaccessToken({
        id: foundUser.id,
        email: foundUser.email,
        roleUserLevel: foundUser.roleUserLevel,
      });

      const refreshtoken = await this.createRefreshtoken({
        id: foundUser.id,
        email: foundUser.email,
      });

      if (!token) {
        throw new ForbiddenException();
      }

      const date = new Date();
      const accessTokenAgeMs = Number(this.configService.get<string>('ACCESS_TOKEN_AGE_MS'));
      const refreshTokenAgeMs = Number(this.configService.get<string>('REFRESH_TOKEN_AGE_MS'));
      const accessTokentime = new Date(date.getTime() + accessTokenAgeMs);
      const refreshTokentime = new Date(date.getTime() + refreshTokenAgeMs);

      // console.log('[AuthService.signin] login success, email:', email);
      return response.status(200).send({
        message: 'Logged in sucessfully',
        accessTokentime,
        accessToken: token,
        refreshToken: refreshtoken,
        refreshTokentime,
      });
    } catch (error) {
      console.error('[AuthService.signin]', error);
      return response.status(500).send({
        message: 'Failed to Login',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async hashPassword(password: string): Promise<string> {
    // console.log('[AuthService.hashPassword]');
    const saltRounds = Number(this.configService.get<string>('BCRYPT_SALT_ROUNDS'));
    const hash = await bcrypt.hash(password, saltRounds);
    // console.log('[AuthService.hashPassword] hash generated');
    return hash;
  }

  async comparePasswords(args: {
    password: string;
    hash: string;
  }): Promise<boolean> {
    // console.log('[AuthService.comparePasswords]');
    const result = await bcrypt.compare(args.password, args.hash);
    // console.log('[AuthService.comparePasswords] isMatch:', result);
    return result;
  }

  async signaccessToken(args: {
    id: string;
    email: string;
    roleUserLevel: string;
  }): Promise<string> {
    // console.log('[AuthService.signaccessToken] userId:', args.id);
    const payload = {
      id: args.id,
      email: args.email,
      roleUserLevel: args.roleUserLevel,
    };

    const token = await this.jwt.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRY'),
    });

    // console.log('[AuthService.signaccessToken] token generated');
    return token;
  }

  async createRefreshtoken(args: {
    id: string;
    email: string;
  }): Promise<string> {
    // console.log('[AuthService.createRefreshtoken] userId:', args.id);
    const payload = { id: args.id, email: args.email };

    const token = await this.jwt.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRY'),
    });

    // console.log('[AuthService.createRefreshtoken] token generated');
    return token;
  }
}
