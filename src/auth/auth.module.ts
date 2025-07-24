import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
// import { RefreshJwtStrategy } from '../strategies/refrestToken.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
// import { JwtStrategy } from '../strategies/jwt.strategy';
// import { MailerModule } from '@nestjs-modules/mailer';
import { jwt_Access_Secret } from '../config/app.config';
import { PassportModule } from '@nestjs/passport';
import { join } from 'path';
// import {HandlebarsAdapter} from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { PrismaService } from '../../prisma/prisma.service';
import { JwtStrategy } from 'src/strategies/jwt.strategy';

@Module({
  imports: [JwtModule.register({secret:jwt_Access_Secret,signOptions:{expiresIn:60*5}}),PassportModule,
 ],
  controllers: [AuthController],
  providers: [AuthService,JwtService,PrismaService,JwtStrategy]
})
export class AuthModule {}
