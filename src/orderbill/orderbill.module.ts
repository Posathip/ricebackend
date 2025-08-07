import { Module } from '@nestjs/common';
import { OrderbillService } from './orderbill.service';
import { OrderbillController } from './orderbill.controller';

@Module({
  controllers: [OrderbillController],
  providers: [OrderbillService],
})
export class OrderbillModule {}
