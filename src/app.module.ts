import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TradeModule } from './trade/trade.module';


import { PrismaService } from 'prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { RecordnotificationModule } from './recordnotification/recordnotification.module';
import { OrderbillModule } from './orderbill/orderbill.module';
import { UserModule } from './user/user.module';

import { CompanyModule } from './company/company.module';
import { CertificateModule } from './certificate/certificate.module';
import { StatisticModule } from './statistic/statistic.module';
import { AdminModule } from './admin/admin.module';


@Module({
  imports: [    ConfigModule.forRoot({
      isGlobal: true, // ให้ config ใช้ได้ทั่วแอป
    }), TradeModule, AuthModule, RecordnotificationModule, OrderbillModule, UserModule, CompanyModule, CertificateModule, StatisticModule, AdminModule, 
],
  controllers: [AppController],
  providers: [AppService,PrismaService],
})
export class AppModule {}
