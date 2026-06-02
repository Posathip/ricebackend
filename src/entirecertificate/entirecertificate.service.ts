import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  CreateEntireCertificateDto,
  UpdateEntireCertificateDto,
} from 'src/dto/entirecertificate.dto';

@Injectable()
export class EntirecertificateService {
  constructor(private prisma: PrismaService) {}

  async getAll(request: any, response: any): Promise<void> {
    console.log('[EntirecertificateService.getAll]');
    try {
      const records = await this.prisma.entireCertificate.findMany({
        orderBy: { createdAt: 'desc' },
      });
      console.log('[EntirecertificateService.getAll] count:', records.length);
      return response.status(200).send({ data: records });
    } catch (error) {
      console.error('[EntirecertificateService.getAll]', error);
      return response.status(500).send({ data: null, error: 'Failed to retrieve entire certificate data' });
    }
  }

  async getById(id: string, request: any, response: any): Promise<void> {
    console.log('[EntirecertificateService.getById] id:', id);
    try {
      const record = await this.prisma.entireCertificate.findUnique({
        where: { entireCertificateID: id },
      });
      if (!record) {
        return response.status(404).send({ data: null, error: `EntireCertificate ${id} not found` });
      }
      console.log('[EntirecertificateService.getById] found:', record.entireCertificateID);
      return response.status(200).send({ data: record });
    } catch (error) {
      console.error('[EntirecertificateService.getById]', error);
      return response.status(500).send({ data: null, error: 'Failed to retrieve entire certificate' });
    }
  }

  async create(dto: CreateEntireCertificateDto, request: any, response: any): Promise<void> {
    console.log('[EntirecertificateService.create] shipping:', dto.shipping);
    try {
      if (!dto.shipping) {
        throw new BadRequestException('shipping is required');
      }
      const record = await this.prisma.entireCertificate.create({
        data: {
          orderbillNo: dto.orderbillNo,
          certificateType: dto.certificateType,
          shipper: dto.shipper,
          destination: dto.destination,
          invoice: dto.invoice,
          note: dto.note,
          shipping: dto.shipping,
          statusAccounting: dto.statusAccounting,
          date: dto.date 
        },
      });
      console.log('[EntirecertificateService.create] created:', record.entireCertificateID);
      return response.status(201).send({ data: record });
    } catch (error) {
      console.error('[EntirecertificateService.create]', error);
      if (error instanceof BadRequestException) throw error;
      return response.status(500).send({ data: null, error: 'Failed to create entire certificate' });
    }
  }

  async update(id: string, dto: UpdateEntireCertificateDto, request: any, response: any): Promise<void> {
    console.log('[EntirecertificateService.update] id:', id);
    try {
      const existing = await this.prisma.entireCertificate.findUnique({
        where: { entireCertificateID: id },
      });
      if (!existing) {
        return response.status(404).send({ data: null, error: `EntireCertificate ${id} not found` });
      }
      const record = await this.prisma.entireCertificate.update({
        where: { entireCertificateID: id },
        data: dto,
      });
      console.log('[EntirecertificateService.update] updated:', record.entireCertificateID);
      return response.status(200).send({ data: record });
    } catch (error) {
      console.error('[EntirecertificateService.update]', error);
      return response.status(500).send({ data: null, error: 'Failed to update entire certificate' });
    }
  }

  async remove(id: string, request: any, response: any): Promise<void> {
    console.log('[EntirecertificateService.remove] id:', id);
    try {
      const existing = await this.prisma.entireCertificate.findUnique({
        where: { entireCertificateID: id },
      });
      if (!existing) {
        return response.status(404).send({ data: null, error: `EntireCertificate ${id} not found` });
      }
      await this.prisma.entireCertificate.delete({
        where: { entireCertificateID: id },
      });
      console.log('[EntirecertificateService.remove] deleted:', id);
      return response.status(200).send({ data: { message: `EntireCertificate ${id} deleted successfully` } });
    } catch (error) {
      console.error('[EntirecertificateService.remove]', error);
      return response.status(500).send({ data: null, error: 'Failed to delete entire certificate' });
    }
  }

  async getLatestNumber(type: string,   request: any, response: any): Promise<void> {
    console.log('[EntirecertificateService.getLatestNumber]');
    try {
      const record = await this.prisma.entireCertificate.findFirst({
        where: { certificateType: type },
        orderBy: { orderbillNo: 'desc' },
        select: { orderbillNo: true },
      });
      const latestNumber = record?.orderbillNo ?? 0;
      console.log('[EntirecertificateService.getLatestNumber] latestNumber:', latestNumber);
      return response.status(200).send({ data: { orderbillNo: latestNumber } });
    } catch (error) {
      console.error('[EntirecertificateService.getLatestNumber]', error);
      return response.status(500).send({ data: null, error: 'Failed to retrieve latest orderbillNo' });
    }
  }

  private buildTypeFilter(type: string): object {
    return type === 'All' ? {} : { certificateType: type };
  }

  async filterByDay(startDate: string, endDate: string, type: string, _request: any, response: any): Promise<void> {
    console.log('[EntirecertificateService.filterByDay] startDate:', startDate, 'endDate:', endDate, 'type:', type);
    try {
      const records = await this.prisma.entireCertificate.findMany({
        where: {
          // date: { gte: new Date(startDate), lte: new Date(endDate) },
          // ...this.buildTypeFilter(type),
        },
        orderBy: { date: 'asc' },
      });
      console.log('[EntirecertificateService.filterByDay] count:', records.length);
      return response.status(200).send({ data: records });
    } catch (error) {
      console.error('[EntirecertificateService.filterByDay]', error);
      return response.status(500).send({ data: null, error: 'Failed to filter by day' });
    }
  }

  async filterByMonth(month: string, year: string, type: string, _request: any, response: any): Promise<void> {
    console.log('[EntirecertificateService.filterByMonth] month:', month, 'year:', year, 'type:', type);
    try {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 1);
      const records = await this.prisma.entireCertificate.findMany({
        where: {
          date: { gte: start, lt: end },
          ...this.buildTypeFilter(type),
        },
        orderBy: { date: 'asc' },
      });
      console.log('[EntirecertificateService.filterByMonth] count:', records.length);
      return response.status(200).send({ data: records });
    } catch (error) {
      console.error('[EntirecertificateService.filterByMonth]', error);
      return response.status(500).send({ data: null, error: 'Failed to filter by month' });
    }
  }

  async filterByYear(year: string, type: string, _request: any, response: any): Promise<void> {
    console.log('[EntirecertificateService.filterByYear] year:', year, 'type:', type);
    try {
      const y = parseInt(year, 10);
      const start = new Date(y, 0, 1);
      const end = new Date(y + 1, 0, 1);
      const records = await this.prisma.entireCertificate.findMany({
        where: {
          date: { gte: start, lt: end },
          ...this.buildTypeFilter(type),
        },
        orderBy: { date: 'asc' },
      });
      console.log('[EntirecertificateService.filterByYear] count:', records.length);
      return response.status(200).send({ data: records });
    } catch (error) {
      console.error('[EntirecertificateService.filterByYear]', error);
      return response.status(500).send({ data: null, error: 'Failed to filter by year' });
    }
  }

  async filterByType(type: string, request: any, response: any): Promise<void> {
    console.log('[EntirecertificateService.filterByType] type:', type);
    try {
      const records = await this.prisma.entireCertificate.findMany({
        where: { certificateType: type },
        orderBy: { createdAt: 'desc' },
      });
      console.log('[EntirecertificateService.filterByType] count:', records.length);
      return response.status(200).send({ data: records });
    } catch (error) {
      console.error('[EntirecertificateService.filterByType]', error);
      return response.status(500).send({ data: null, error: 'Failed to filter entire certificates by type' });
    }
  }
}
