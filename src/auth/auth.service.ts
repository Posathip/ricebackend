
import { BadRequestException, ForbiddenException, Injectable, Req, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, response, Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

import * as bcrypt from 'bcrypt';

import * as crypto from 'crypto';
import { jwt_Access_Secret, jwt_Refresh_Secret } from '../config/app.config';
import { CreateAccountUser, LoginDTO } from 'src/dto/user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  [x: string]: any;
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
 private readonly configService: ConfigService,
  ) {}



async createAccountUser(

   dto: CreateAccountUser,
       req: Request,
  res: Response
){
    const checkEmail = await this.prisma.user.findUnique({
        where: { email: dto.email}
    });

    if (checkEmail){
        throw new BadRequestException('Email already exist');
    }
       const password =  "9kaifarmsas";
           
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
}

async testsignin(
    dto: LoginDTO,
     req: Request,
  res: Response
){
    try {
         return res.status(200).send({
         message: `Create account email:  complete`,
       });
    } catch (error) {
        return res.status(500).send({
            message: 'Failed to create account',
            error: error.message || error,
          });
        
    }

}
async signin(
    dto: LoginDTO,
     req: Request,
  res: Response
  ) {
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
    //   response.cookie('token', refreshtoken, {
    //     httpOnly: true, sameSite: 'none', secure: true , maxAge: 24 * 60 * 60 * 1000,
    //     domain: 'asia-southeast1-agtechaibackend.cloudfunctions.net'
    //   });
      const date = new Date();
      const accesstoken_age = new Date(date.getTime() + 30 * 60000);
      const refreshtoken_age = new Date(date.getTime() + 24 * 60 * 60 * 1000);
       
      return {
        message: 'Logged in sucessfully',
        accessTokentime: accesstoken_age,
        accessToken: token,
        refreshToken: refreshtoken,
        refreshTokentime: refreshtoken_age,
      }; 
} catch (error) {
    console.error('Login error:', error); // log เต็ม
  return res.status(500).send({
    message: 'Failed to Login',
    error: error instanceof Error ? error.message : 'Unknown error',
  });
}
    
   
    
    //sign jwt and return to the user
}
//     async signout(
//         @Req() request: FastifyRequest,
//         @Res({ passthrough: true }) response: FastifyReply,
//       ) {
//         console.log(request.cookies);
//         response.clearCookie('token',{
//             path: '/auth', // Clear only for a specific path
          
//             secure: true, // Only clear the cookie over HTTPS
//           });
//         return response.status(202).send({ message: 'Log Out Successfully' });
//       }
    

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
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
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

//   async refresh(
//     headers,

//     request: FastifyRequest,
//     @Res({ passthrough: true }) response: FastifyReply,
//   ) {
//     // response.clearCookie('token',{
//     //   path: '/', // Clear only for a specific path
    
//     //   secure: true, // Only clear the cookie over HTTPS
//     // });

//     // console.log(token);
//     // const payload = await this.jwt.verify(token, {
//     //   secret: jwt_Refresh_Secret,
//     // });
//     const refreshtoken = headers.substring(7, headers.length);
//     const headerdecode = await this.jwt.verify(refreshtoken, {
//       secret: jwt_Refresh_Secret,
//     });

//     const foundUser = await this.prisma.userAuthen.findUnique({
//       where: { email: headerdecode.email },
//     });

//     const companyUser = await this.prisma.user.findUnique({
//       where: { user_ID: headerdecode.id },
//     })

//     if (!foundUser) {
//       throw new BadRequestException('No account right now');
//     }

//     const newaccesstoken = await this.signaccessToken({
//       id: headerdecode.id,
//       email: headerdecode.email,
//       roleUserLevel: foundUser.roleUserLevel,
     
//     });
//     //sign jwt and return to the user
//     const newrefreshtoken = await this.createRefreshtoken({
//       id: refreshtoken.id,
//       email: refreshtoken.email,
//     });
//     const date = new Date();
//     const accesstoken_age = new Date(date.getTime() + 30 * 60000);
//     // response.setCookie('token', newrefreshtoken, {
//     //   httpOnly: true, sameSite: 'none', secure: true , maxAge: 24 * 60 * 60 * 1000,
//     //   domain: 'asia-southeast1-agtechaibackend.cloudfunctions.net'
//     // });

//     return response.status(200).send({
//       message: 'refresh token complete',
//       newaccesstoken: newaccesstoken,
//       accesstokenexpiredin: accesstoken_age,
//     });
//   }
}