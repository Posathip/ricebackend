import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [TradeController],
  providers: [TradeService,PrismaService],
})
export class TradeModule {}
