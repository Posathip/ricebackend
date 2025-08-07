import { Controller } from '@nestjs/common';
import { OrderbillService } from './orderbill.service';

@Controller('orderbill')
export class OrderbillController {
  constructor(private readonly orderbillService: OrderbillService) {}
}
