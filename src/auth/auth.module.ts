import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { jwt_Access_Secret } from 'src/config/app.config';
import { join } from 'path';
import { PassportModule } from '@nestjs/passport';
@Module({
   imports: [JwtModule.register({secret:jwt_Access_Secret,signOptions:{expiresIn:60*5}}),PassportModule,
   ],
  controllers: [AuthController],
  providers: [AuthService,JwtService,PrismaService],
})
export class AuthModule {}
