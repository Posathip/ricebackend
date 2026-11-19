import { Module } from '@nestjs/common';
import { RecordnotificationService } from './recordnotification.service';
import { RecordnotificationController } from './recordnotification.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [RecordnotificationController],
  providers: [RecordnotificationService,PrismaService],
})
export class RecordnotificationModule {}
