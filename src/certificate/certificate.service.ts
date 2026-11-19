import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, certificatesheet } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { buildLicenseHistory, LicenseHistoryResponse } from 'src/common/license-history';
import { rethrowAsHttpException } from 'src/common/service-error';
import { UpdateCertificateDto } from 'src/dto/certificatesheet.dto';

const CERT_NO_PAD_LENGTH = 5;
const LICENSE_NO_PREFIX_LENGTH = 6;
const DECIMAL_RADIX = 10;
const TWO_DECIMALS: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
const THAI_DATE_FORMAT = new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
const TOTAL_TONNAGE_KEY = 'รวมปริมาณตัน';

const CERTIFICATE_LIST_SELECT = {
  certificateSheetID: true,
  certNo: true,
  paperNoCopy: true,
  paperNoOriginal: true,
  specialJob: true,
  index: true,
  companyName: true,
  surveyLocateNameThai: true,
  destination: true,
  riceType: true,
  totalNettWeight: true,
} satisfies Prisma.certificatesheetSelect;

const CERTIFICATE_DETAIL_SELECT = {
  certificateSheetID: true,
  certNo: true,
  paperNoOriginal: true,
  paperNoCopy: true,
  licenseNumber: true,
  jobID: true,
  index: true,
  specialJob: true,
  No: true,
  title: true,
  companyName: true,
  surveyLocateNameThai: true,
  portName: true,
  destination: true,
  netWeightTON: true,
  riceType: true,
  note: true,
  dateCertificate: true,
  quantity: true,
  unit: true,
  descriptionOfGoodsLine1: true,
  descriptionOfGoodsLine2: true,
  descriptionOfGoodsLine3: true,
  packing: true,
  unitKGS_Nett: true,
  marks: true,
  shipper: true,
  goDown: true,
  dateOfLoading: true,
  dateCheckWeight: true,
  shippingPort: true,
  carryingVessel: true,
  qualityLine1: true,
  qualityLine2: true,
  weight: true,
  totalGrossWeight: true,
  totalTareWeight: true,
  totalNettWeight: true,
  status: true,
  packingLine1: true,
  packingLine2: true,
  packingLine3: true,
  applyGodown: true,
  checkWeight: {
    select: {
      supplierName: true,
      time: true,
      noOfBags: true,
      grossWeight: true,
      netWeightW: true,
      netWeightTon: true,
      remainWeight: true,
      weightPerTon: true,
      goDown: true,
      loadingDetails: true,
      specialJob: true,
      vehicleName: true,
      riceName: true,
      quantity: true,
    },
  },
} satisfies Prisma.certificatesheetSelect;

const CERTIFICATE_EXPORT_SELECT = {
  certNo: true,
  paperNoCopy: true,
  paperNoOriginal: true,
  companyName: true,
  destination: true,
  riceType: true,
  quantity: true,
  dateCertificate: true,
  goDown: true,
  licenseNumber: true,
  jobID: true,
  shippingPort: true,
} satisfies Prisma.certificatesheetSelect;

/** Fields that must be unique across certificate sheets. */
const UNIQUE_NUMBER_FIELDS = ['certNo', 'paperNoOriginal', 'paperNoCopy'] as const;

type CertificateListItem = Prisma.certificatesheetGetPayload<{ select: typeof CERTIFICATE_LIST_SELECT }>;
type CertificateDetail = Prisma.certificatesheetGetPayload<{ select: typeof CERTIFICATE_DETAIL_SELECT }>;
type CertificateExportSource = Prisma.certificatesheetGetPayload<{ select: typeof CERTIFICATE_EXPORT_SELECT }>;

export type CertificateListByDateItem = CertificateListItem & { status: boolean };

export interface CertificatesByDateResponse {
  data: CertificateListByDateItem[];
  previousDayLatestCertNo: number;
  previousDayDate: Date | null;
  previousDayPaperNoOriginal: number;
  previousDayPaperNoCopy: number;
}

export type CertificateDetailWithEnNames = CertificateDetail & {
  carryingVessel: string;
  descriptionOfGoodsLine1: string;
  descriptionOfGoodsLine2: string;
  descriptionOfGoodsLine3: string;
  shipper: string;
  surveyLocateNameEN: string | null;
  riceTypeEN: string | null;
  companyNameEN: string | null;
};

export interface CertificateSearchFilters {
  certNo?: string;
  jobID?: string;
  licenseNumber?: string;
}

/** One row of the certificate export sheet — keys are the Thai column headers used by the frontend. */
export type CertificateExportRow = Record<string, string | number>;

export interface CertificateExportResponse {
  result: CertificateExportRow[];
  [TOTAL_TONNAGE_KEY]: string;
}

@Injectable()
export class CertificateService {
  constructor(private readonly prisma: PrismaService) {}

  async getCertificatesByDate(date: string): Promise<CertificatesByDateResponse> {
    console.log('[CertificateService.getCertificatesByDate] date:', date);
    try {
      const { gte: startOfDay, lt: endOfDay } = this.buildDayRange(new Date(date));

      const [certificates, previousDayDate, latestCertNo, latestPaperNo] = await Promise.all([
        this.prisma.certificatesheet.findMany({
          where: { dateCheckWeight: { gte: startOfDay, lt: endOfDay } },
          select: { ...CERTIFICATE_LIST_SELECT, status: true },
          orderBy: { dateCheckWeight: 'asc' },
        }),
        this.findPreviousCheckWeightDate(startOfDay),
        this.prisma.certificatesheet.findFirst({
          where: { certNo: { not: null } },
          orderBy: { certNo: 'desc' },
          select: { certNo: true },
        }),
        this.prisma.certificatesheet.findFirst({
          where: { paperNoOriginal: { not: null } },
          orderBy: { paperNoOriginal: 'desc' },
          select: { paperNoOriginal: true, paperNoCopy: true },
        }),
      ]);

      console.log('[CertificateService.getCertificatesByDate] result count:', certificates.length);
      return {
        data: certificates,
        previousDayLatestCertNo: latestCertNo?.certNo || 0,
        previousDayDate,
        previousDayPaperNoOriginal: latestPaperNo?.paperNoOriginal || 0,
        previousDayPaperNoCopy: latestPaperNo?.paperNoCopy || 0,
      };
    } catch (error) {
      rethrowAsHttpException('CertificateService.getCertificatesByDate', error);
    }
  }

  async updateCertificate(certificateId: string, dto: UpdateCertificateDto): Promise<certificatesheet> {
    console.log('[CertificateService.updateCertificate] certificateId:', certificateId);
    try {
      const existing = await this.prisma.certificatesheet.findUnique({
        where: { certificateSheetID: certificateId },
        select: { certificateSheetID: true },
      });
      if (!existing) throw new NotFoundException('Certificate not found');

      await this.assertUniqueNumbers(certificateId, dto);

      const updated = await this.prisma.certificatesheet.update({
        where: { certificateSheetID: certificateId },
        data: dto,
      });
      console.log('[CertificateService.updateCertificate] result:', updated.certificateSheetID);
      return updated;
    } catch (error) {
      rethrowAsHttpException('CertificateService.updateCertificate', error);
    }
  }

  async getCertificateById(certificateId: string): Promise<CertificateDetailWithEnNames> {
    console.log('[CertificateService.getCertificateById] certificateId:', certificateId);
    try {
      const certificate = await this.prisma.certificatesheet.findUnique({
        where: { certificateSheetID: certificateId },
        select: CERTIFICATE_DETAIL_SELECT,
      });
      if (!certificate) throw new NotFoundException('Certificate not found');

      const [survey, rice, company] = await Promise.all([
        this.prisma.surveyName.findFirst({
          where: { surveyNameTH: certificate.surveyLocateNameThai || '' },
          select: { surveyNameEN: true },
        }),
        this.prisma.riceManage.findFirst({
          where: { riceNameThai: certificate.riceType || '' },
          select: { riceNameEng: true },
        }),
        this.prisma.company.findFirst({
          where: { companyNameTH: certificate.companyName || '' },
          select: { companyNameEN: true },
        }),
      ]);

      const result: CertificateDetailWithEnNames = {
        ...certificate,
        carryingVessel: this.toUpperCase(certificate.carryingVessel),
        descriptionOfGoodsLine1: this.toUpperCase(certificate.descriptionOfGoodsLine1),
        descriptionOfGoodsLine2: this.toUpperCase(certificate.descriptionOfGoodsLine2),
        descriptionOfGoodsLine3: this.toUpperCase(certificate.descriptionOfGoodsLine3),
        shipper: this.toTitleCase(certificate.shipper),
        surveyLocateNameEN: survey?.surveyNameEN || null,
        riceTypeEN: rice?.riceNameEng || null,
        companyNameEN: company?.companyNameEN || null,
      };
      console.log('[CertificateService.getCertificateById] result:', result.certificateSheetID);
      return result;
    } catch (error) {
      rethrowAsHttpException('CertificateService.getCertificateById', error);
    }
  }

  async searchCertificates(filters: CertificateSearchFilters): Promise<CertificateListItem[]> {
    console.log('[CertificateService.searchCertificates] filters:', filters);
    try {
      const certificates = await this.prisma.certificatesheet.findMany({
        where: this.buildSearchWhere(filters),
        select: CERTIFICATE_LIST_SELECT,
      });
      if (certificates.length === 0) throw new NotFoundException('No data found');

      console.log('[CertificateService.searchCertificates] result count:', certificates.length);
      return certificates;
    } catch (error) {
      rethrowAsHttpException('CertificateService.searchCertificates', error);
    }
  }

  async exportCertificatesByDateRange(startDate: string, endDate: string): Promise<CertificateExportResponse> {
    console.log('[CertificateService.exportCertificatesByDateRange] startDate:', startDate, 'endDate:', endDate);
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const result = await this.buildCertificateExport(start, end, 'Data Not found');
      console.log('[CertificateService.exportCertificatesByDateRange] result count:', result.result.length);
      return result;
    } catch (error) {
      rethrowAsHttpException('CertificateService.exportCertificatesByDateRange', error);
    }
  }

  async exportCertificatesByMonth(month: string, year: string): Promise<CertificateExportResponse> {
    console.log('[CertificateService.exportCertificatesByMonth] month:', month, 'year:', year);
    try {
      const monthIndex = this.parseInteger(month, 'month') - 1;
      const yearNumber = this.parseInteger(year, 'year');
      const start = new Date(yearNumber, monthIndex, 1);
      // Day 0 of the next month = last day of this month (handles 28/29/30/31-day months).
      const end = new Date(yearNumber, monthIndex + 1, 0, 23, 59, 59, 999);

      const result = await this.buildCertificateExport(start, end, 'Data Notfound');
      console.log('[CertificateService.exportCertificatesByMonth] result count:', result.result.length);
      return result;
    } catch (error) {
      rethrowAsHttpException('CertificateService.exportCertificatesByMonth', error);
    }
  }

  async getCertificateHistory(licenseNumber: string): Promise<LicenseHistoryResponse> {
    console.log('[CertificateService.getCertificateHistory] licenseNumber:', licenseNumber);
    try {
      const result = await buildLicenseHistory(this.prisma, licenseNumber, {
        certificate: { status: true },
      });
      console.log('[CertificateService.getCertificateHistory] result groups:', result.data.length);
      return result;
    } catch (error) {
      rethrowAsHttpException('CertificateService.getCertificateHistory', error);
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async findPreviousCheckWeightDate(before: Date): Promise<Date | null> {
    const latestBefore = await this.prisma.certificatesheet.findFirst({
      where: { dateCheckWeight: { lt: before } },
      orderBy: { dateCheckWeight: 'desc' },
      select: { dateCheckWeight: true },
    });
    const previousDayRange = this.buildDayRange(new Date(latestBefore?.dateCheckWeight || before));
    const latestOnPreviousDay = await this.prisma.certificatesheet.findFirst({
      where: { dateCheckWeight: previousDayRange },
      orderBy: { dateCheckWeight: 'desc' },
      select: { dateCheckWeight: true },
    });
    return latestOnPreviousDay?.dateCheckWeight || null;
  }

  private async assertUniqueNumbers(certificateId: string, dto: UpdateCertificateDto): Promise<void> {
    for (const field of UNIQUE_NUMBER_FIELDS) {
      const value = dto[field];
      if (value === undefined) continue;

      const duplicate = await this.prisma.certificatesheet.findFirst({
        where: { [field]: value, NOT: { certificateSheetID: certificateId } },
        select: { certificateSheetID: true },
      });
      if (duplicate) throw new BadRequestException(`${field} already exists`);
    }
  }

  private buildSearchWhere(filters: CertificateSearchFilters): Prisma.certificatesheetWhereInput {
    const certNo = filters.certNo ? parseInt(filters.certNo, DECIMAL_RADIX) : NaN;
    const jobID = filters.jobID ? Number(filters.jobID) : NaN;
    return {
      ...(!isNaN(certNo) && certNo !== 0 && { certNo }),
      ...(!isNaN(jobID) && { jobID }),
      ...(filters.licenseNumber && {
        licenseNumber: { contains: filters.licenseNumber, mode: 'insensitive' as const },
      }),
    };
  }

  private async buildCertificateExport(
    start: Date,
    end: Date,
    notFoundMessage: string,
  ): Promise<CertificateExportResponse> {
    const certificates = await this.prisma.certificatesheet.findMany({
      where: { dateCheckWeight: { gte: start, lte: end }, certNo: { not: null } },
      select: CERTIFICATE_EXPORT_SELECT,
      orderBy: { certNo: 'asc' },
    });
    if (certificates.length === 0) throw new NotFoundException(notFoundMessage);

    const [companyNameEnByTh, riceNameEnByTh] = await Promise.all([
      this.buildCompanyNameEnMap(certificates.map((c) => c.companyName || '')),
      this.buildRiceNameEnMap(certificates.map((c) => c.riceType || '')),
    ]);

    return {
      result: certificates.map((certificate) =>
        this.toExportRow(certificate, companyNameEnByTh, riceNameEnByTh),
      ),
      [TOTAL_TONNAGE_KEY]: this.formatTwoDecimals(this.sumQuantity(certificates)),
    };
  }

  private toExportRow(
    certificate: CertificateExportSource,
    companyNameEnByTh: Map<string, string>,
    riceNameEnByTh: Map<string, string | null>,
  ): CertificateExportRow {
    return {
      'วันที่': certificate.dateCertificate ? THAI_DATE_FORMAT.format(new Date(certificate.dateCertificate)) : '',
      'ผู้ได้รับอนุญาต':
        companyNameEnByTh.get(certificate.companyName || '') || certificate.companyName || '',
      'ผู้ส่งมอบ': certificate.goDown || '',
      'เลขที่ใบอนุญาต': certificate.licenseNumber?.slice(LICENSE_NO_PREFIX_LENGTH) || '',
      'คำสั่งจ่ายงานเลขที่': certificate.jobID || '',
      'เรือใหญ่': certificate.shippingPort || '',
      'เมืองตราส่ง': certificate.destination || '',
      'ชนิดข้าว': riceNameEnByTh.get(certificate.riceType || '') || certificate.riceType || '',
      'ปริมาณ/เมตริกตัน': this.formatTwoDecimals(Number(certificate.quantity || 0)),
      'CER NO.': this.padCertNo(certificate.certNo),
      'PAPER NO': this.padCertNo(certificate.paperNoCopy),
      'PAPER NO ': this.padCertNo(certificate.paperNoOriginal),
    };
  }

  private async buildCompanyNameEnMap(companyNamesTh: string[]): Promise<Map<string, string>> {
    const companies = await this.prisma.company.findMany({
      where: { companyNameTH: { in: [...new Set(companyNamesTh)] } },
      select: { companyNameTH: true, companyNameEN: true },
    });
    return this.firstMatchMap(companies.map((c) => [c.companyNameTH, c.companyNameEN]));
  }

  private async buildRiceNameEnMap(riceNamesTh: string[]): Promise<Map<string, string | null>> {
    const riceList = await this.prisma.riceManage.findMany({
      where: { riceNameThai: { in: [...new Set(riceNamesTh)] } },
      select: { riceNameThai: true, riceNameEng: true },
    });
    return this.firstMatchMap(
      riceList
        .filter((rice): rice is { riceNameThai: string; riceNameEng: string | null } => rice.riceNameThai !== null)
        .map((rice) => [rice.riceNameThai, rice.riceNameEng]),
    );
  }

  /** Keeps the first value per key — same result as the previous per-row `findFirst` lookups. */
  private firstMatchMap<V>(entries: [string, V][]): Map<string, V> {
    const map = new Map<string, V>();
    for (const [key, value] of entries) {
      if (!map.has(key)) map.set(key, value);
    }
    return map;
  }

  private buildDayRange(date: Date): { gte: Date; lt: Date } {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    return { gte: new Date(year, month, day), lt: new Date(year, month, day + 1) };
  }

  private parseInteger(value: string, fieldName: string): number {
    const parsed = parseInt(value, DECIMAL_RADIX);
    if (isNaN(parsed)) throw new BadRequestException(`Invalid ${fieldName}: ${value}`);
    return parsed;
  }

  private sumQuantity(certificates: CertificateExportSource[]): number {
    return certificates.reduce((sum, certificate) => sum + Number(certificate.quantity || 0), 0);
  }

  private formatTwoDecimals(value: number): string {
    return value.toLocaleString('en-US', TWO_DECIMALS);
  }

  private padCertNo(certNo: number | null | undefined): string {
    return certNo ? certNo.toString().padStart(CERT_NO_PAD_LENGTH, '0') : '';
  }

  private toUpperCase(value: string | null | undefined): string {
    return value ? value.toUpperCase() : '';
  }

  private toTitleCase(value: string | null | undefined): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
