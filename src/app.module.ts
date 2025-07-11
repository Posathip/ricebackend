import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TradeModule } from './trade/trade.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [    ConfigModule.forRoot({
      isGlobal: true, // ให้ config ใช้ได้ทั่วแอป
    }), TradeModule, AuthModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
