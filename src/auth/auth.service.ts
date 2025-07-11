import { BadRequestException, ForbiddenException, Injectable, Req, Res,  } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAccountUser, LoginDTO } from 'src/dto/user.dto';
import { jwt_Access_Secret, jwt_Refresh_Secret } from '../config/app.config';
import * as bcrypt from 'bcrypt';
import { Request, response, Response } from 'express';
import * as crypto from 'crypto';
@Injectable()
export class AuthService {
  [x: string]: any;
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  

  async createAccountUser(
    dto: CreateAccountUser,
    @Req() req: Request,
  @Res({ passthrough: true }) res: Response, // ✅ ต้องมี passthrough
  ) {
    try {
        const password =  "9kaifarm";
        
    const hashpassword = await this.hashPassword(password);
    console.log(hashpassword)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: password,
       hashpassword: hashpassword,
        roleUserLevel: dto.roleUserLevel,
      },
    });

    return response.status(200).send({
      message: `Create account email: ${dto.email} ${dto.company} complete`,
    });
    } catch (error) {
      return res.status(500).send({
        message: 'Failed to create account',
        error: error.message || error,
      });
    }
  }

  async hashPassword(password: string) {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }
  async comparePasswords(args: { password: string; hash: string }) {
    return await bcrypt.compare(args.password, args.hash);
  }

  async signaccessToken(args: {
    id: string;
    email: string;
    roleUserLevel: string;
  }) {
    const payload = {
      id: args.id,
      email: args.email,
      roleUserLevel: args.roleUserLevel,
    };

    const token = await this.jwt.signAsync(payload, {
      secret: jwt_Access_Secret,
      expiresIn: '30m',
    });

    // const token = await this.jwt.signAsync(payload)

    return token;
  }

  async createRefreshtoken(args: { id: string; email: string }) {
    const payload = { id: args.id, email: args.email };

    const token = await this.jwt.signAsync(payload, {
      secret: jwt_Refresh_Secret,
      expiresIn: '1d',
    });
    return token;
  }

  async signin(
    dto: LoginDTO,
 @Req() req: Request,
  @Res({ passthrough: true }) res: Response, 
  ) {
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
      response.cookie('token', refreshtoken, {
        httpOnly: true, sameSite: 'none', secure: true , maxAge: 24 * 60 * 60 * 1000,
        domain: 'asia-southeast1-agtechaibackend.cloudfunctions.net'
      });
      const date = new Date();
      const accesstoken_age = new Date(date.getTime() + 30 * 60000);
      const refreshtoken_age = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      return response.status(200).send({
        message: 'Logged in sucessfully',
        accessTokentime: accesstoken_age,
        accessToken: token,
        refreshToken: refreshtoken,
        refreshTokentime: refreshtoken_age,
      });
    }
    //sign jwt and return to the user
}
