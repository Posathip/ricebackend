import { Module } from '@nestjs/common';
import { OrderbillService } from './orderbill.service';
import { OrderbillController } from './orderbill.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [OrderbillController],
  providers: [OrderbillService,PrismaService],
})
export class OrderbillModule {}
