import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [TradeController],
  providers: [TradeService,PrismaService, JwtService],
})
export class TradeModule {}
