import { Module } from '@nestjs/common';
import { RecordnotificationService } from './recordnotification.service';
import { RecordnotificationController } from './recordnotification.controller';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [RecordnotificationController],
  providers: [RecordnotificationService,PrismaService, JwtService],
})
export class RecordnotificationModule {}
