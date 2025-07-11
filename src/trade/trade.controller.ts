import { Controller, Post, Req, Res } from '@nestjs/common';
import { TradeService } from './trade.service';
import { Request, Response } from 'express';

@Controller('trade')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Post('getdata')
  getdata(@Req() req: Request, @Res() res: Response) {
    return this.tradeService.getData(req, res);
  }
}

