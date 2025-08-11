import { Module } from '@nestjs/common';
import { OrderbillService } from './orderbill.service';
import { OrderbillController } from './orderbill.controller';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [OrderbillController],
  providers: [OrderbillService,PrismaService, JwtService],
})
export class OrderbillModule {}
