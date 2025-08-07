import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import fastifyXmlBodyParser from 'fastify-xml-body-parser';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { join } from 'path';
import { jwt_Access_Secret } from './config/app.config';
import fastifyCookie from '@fastify/cookie';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ maxParamLength: 1000 }),
  );

   app.register(fastifyXmlBodyParser);
   app.register(fastifyCookie, {
    secret: jwt_Access_Secret, // for cookies signature
  });
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //stripp properties
    }),
  );
  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });
  app.setViewEngine({
    engine: {
      handlebars: require('handlebars'),
    },
    templates: join(__dirname, '..', '/views'),
  });


  const configService = app.get(ConfigService);


  
  const appPort = configService.get<number>('APP_PORT') || 3000;
  const appHost = configService.get<string>('APP_HOST') || '0.0.0.0';

  await app.listen(appPort, appHost);
  console.log(`Application is running on: ${await app.getUrl()}`);
 
}
bootstrap();
