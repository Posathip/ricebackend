import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, entireCertificate } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { rethrowAsHttpException } from 'src/common/service-error';
import {
  CreateEntireCertificateDto,
  UpdateEntireCertificateDto,
} from 'src/dto/entirecertificate.dto';

const ALL_TYPES = 'All';
const DECIMAL_RADIX = 10;
const JANUARY = 0;

export interface DataWrapper<T> {
  data: T;
}

@Injectable()
export class EntirecertificateService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<DataWrapper<entireCertificate[]>> {
    console.log('[EntirecertificateService.getAll]');
    try {
      const certificates = await this.prisma.entireCertificate.findMany({
        orderBy: { createdAt: 'desc' },
      });
      console.log('[EntirecertificateService.getAll] result count:', certificates.length);
      return { data: certificates };
    } catch (error) {
      rethrowAsHttpException('EntirecertificateService.getAll', error);
    }
  }

  async getById(id: string): Promise<DataWrapper<entireCertificate>> {
    console.log('[EntirecertificateService.getById] id:', id);
    try {
      const certificate = await this.findByIdOrThrow(id);
      console.log('[EntirecertificateService.getById] result:', certificate.entireCertificateID);
      return { data: certificate };
    } catch (error) {
      rethrowAsHttpException('EntirecertificateService.getById', error);
    }
  }

  async create(dto: CreateEntireCertificateDto): Promise<DataWrapper<entireCertificate>> {
    console.log('[EntirecertificateService.create] shipping:', dto.shipping);
    try {
      if (!dto.shipping) throw new BadRequestException('shipping is required');

      const certificate = await this.prisma.entireCertificate.create({
        data: {
          orderbillNo: dto.orderbillNo,
          certificateType: dto.certificateType,
          shipper: dto.shipper,
          destination: dto.destination,
          invoice: dto.invoice,
          note: dto.note,
          shipping: dto.shipping,
          statusAccounting: dto.statusAccounting,
          date: dto.date,
        },
      });
      console.log('[EntirecertificateService.create] result:', certificate.entireCertificateID);
      return { data: certificate };
    } catch (error) {
      rethrowAsHttpException('EntirecertificateService.create', error);
    }
  }

  async update(
    id: string,
    dto: UpdateEntireCertificateDto,
  ): Promise<DataWrapper<entireCertificate>> {
    console.log('[EntirecertificateService.update] id:', id);
    try {
      await this.findByIdOrThrow(id);
      const certificate = await this.prisma.entireCertificate.update({
        where: { entireCertificateID: id },
        data: dto,
      });
      console.log('[EntirecertificateService.update] result:', certificate.entireCertificateID);
      return { data: certificate };
    } catch (error) {
      rethrowAsHttpException('EntirecertificateService.update', error);
    }
  }

  async remove(id: string): Promise<DataWrapper<{ message: string }>> {
    console.log('[EntirecertificateService.remove] id:', id);
    try {
      await this.findByIdOrThrow(id);
      await this.prisma.entireCertificate.delete({ where: { entireCertificateID: id } });
      console.log('[EntirecertificateService.remove] result deleted:', id);
      return { data: { message: `EntireCertificate ${id} deleted successfully` } };
    } catch (error) {
      rethrowAsHttpException('EntirecertificateService.remove', error);
    }
  }

  async getLatestOrderbillNo(type: string): Promise<DataWrapper<{ orderbillNo: number }>> {
    console.log('[EntirecertificateService.getLatestOrderbillNo] type:', type);
    try {
      const latestCertificate = await this.prisma.entireCertificate.findFirst({
        where: { certificateType: type },
        orderBy: { orderbillNo: 'desc' },
        select: { orderbillNo: true },
      });
      const orderbillNo = latestCertificate?.orderbillNo ?? 0;
      console.log('[EntirecertificateService.getLatestOrderbillNo] result:', orderbillNo);
      return { data: { orderbillNo } };
    } catch (error) {
      rethrowAsHttpException('EntirecertificateService.getLatestOrderbillNo', error);
    }
  }

  async filterByDay(
    startDate: string,
    endDate: string,
    type?: string,
  ): Promise<DataWrapper<entireCertificate[]>> {
    console.log('[EntirecertificateService.filterByDay] startDate:', startDate, 'endDate:', endDate, 'type:', type);
    try {
      const dateRange = { gte: this.parseDate(startDate), lte: this.parseDate(endDate) };
      const certificates = await this.findByDateRange(dateRange, type);
      console.log('[EntirecertificateService.filterByDay] result count:', certificates.length);
      return { data: certificates };
    } catch (error) {
      rethrowAsHttpException('EntirecertificateService.filterByDay', error);
    }
  }

  async filterByMonth(
    month: string,
    year: string,
    type?: string,
  ): Promise<DataWrapper<entireCertificate[]>> {
    console.log('[EntirecertificateService.filterByMonth] month:', month, 'year:', year, 'type:', type);
    try {
      const monthIndex = this.parseInteger(month, 'month') - 1;
      const yearNumber = this.parseInteger(year, 'year');
      const dateRange = {
        gte: new Date(yearNumber, monthIndex, 1),
        lt: new Date(yearNumber, monthIndex + 1, 1),
      };
      const certificates = await this.findByDateRange(dateRange, type);
      console.log('[EntirecertificateService.filterByMonth] result count:', certificates.length);
      return { data: certificates };
    } catch (error) {
      rethrowAsHttpException('EntirecertificateService.filterByMonth', error);
    }
  }

  async filterByYear(year: string, type?: string): Promise<DataWrapper<entireCertificate[]>> {
    console.log('[EntirecertificateService.filterByYear] year:', year, 'type:', type);
    try {
      const yearNumber = this.parseInteger(year, 'year');
      const dateRange = {
        gte: new Date(yearNumber, JANUARY, 1),
        lt: new Date(yearNumber + 1, JANUARY, 1),
      };
      const certificates = await this.findByDateRange(dateRange, type);
      console.log('[EntirecertificateService.filterByYear] result count:', certificates.length);
      return { data: certificates };
    } catch (error) {
      rethrowAsHttpException('EntirecertificateService.filterByYear', error);
    }
  }

  async filterByType(type: string): Promise<DataWrapper<entireCertificate[]>> {
    console.log('[EntirecertificateService.filterByType] type:', type);
    try {
      const certificates = await this.prisma.entireCertificate.findMany({
        where: { certificateType: type },
        orderBy: { createdAt: 'desc' },
      });
      console.log('[EntirecertificateService.filterByType] result count:', certificates.length);
      return { data: certificates };
    } catch (error) {
      rethrowAsHttpException('EntirecertificateService.filterByType', error);
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async findByIdOrThrow(id: string): Promise<entireCertificate> {
    const certificate = await this.prisma.entireCertificate.findUnique({
      where: { entireCertificateID: id },
    });
    if (!certificate) throw new NotFoundException(`EntireCertificate ${id} not found`);
    return certificate;
  }

  private findByDateRange(
    dateRange: Prisma.DateTimeNullableFilter,
    type?: string,
  ): Promise<entireCertificate[]> {
    return this.prisma.entireCertificate.findMany({
      where: { date: dateRange, ...this.buildTypeFilter(type) },
      orderBy: { date: 'asc' },
    });
  }

  private buildTypeFilter(type?: string): Prisma.entireCertificateWhereInput {
    return !type || type === ALL_TYPES ? {} : { certificateType: type };
  }

  private parseDate(value: string): Date {
    const date = new Date(value);
    if (isNaN(date.getTime())) throw new BadRequestException(`Invalid date: ${value}`);
    return date;
  }

  private parseInteger(value: string, fieldName: string): number {
    const parsed = parseInt(value, DECIMAL_RADIX);
    if (isNaN(parsed)) throw new BadRequestException(`Invalid ${fieldName}: ${value}`);
    return parsed;
  }
}
