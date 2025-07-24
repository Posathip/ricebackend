import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TradeModule } from './trade/trade.module';

import { Prisma } from 'generated/prisma';
import { PrismaService } from 'prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { RecordnotificationModule } from './recordnotification/recordnotification.module';


@Module({
  imports: [    ConfigModule.forRoot({
      isGlobal: true, // ให้ config ใช้ได้ทั่วแอป
    }), TradeModule, AuthModule, RecordnotificationModule, 
],
  controllers: [AppController],
  providers: [AppService,PrismaService],
})
export class AppModule {}
