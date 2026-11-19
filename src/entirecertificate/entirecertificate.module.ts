import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { EntirecertificateController } from './entirecertificate.controller';
import { EntirecertificateService } from './entirecertificate.service';

@Module({
  controllers: [EntirecertificateController],
  providers: [EntirecertificateService, PrismaService],
})
export class EntirecertificateModule {}
