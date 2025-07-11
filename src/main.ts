import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
    app.enableCors({
    origin: true,
    credentials: true,
  });
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  const appPort = configService.get<number>('APP_PORT') || 3000;
  const appHost = configService.get<string>('APP_HOST') || '0.0.0.0';

  await app.listen(appPort, appHost);
  console.log(`Application is running on: ${await app.getUrl()}`);
 
}
bootstrap();
