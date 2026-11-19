import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Description, Prisma, Request, validate_Check_Weight } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { buildLicenseHistory, LicenseHistoryResponse } from 'src/common/license-history';
import { rethrowAsHttpException } from 'src/common/service-error';
import { UpdateCheckWeightData, ValidateCheckWeightDto } from 'src/dto/recordNoti.dto';

const CHECKWEIGHT_JOB_NAME = 'Checkweight';
const REQUEST_STATUS_COMPLETED = 'completed';
const DEFAULT_CERTIFICATE_MARKS = 'xxxxxxx';
const COMPANY_SUFFIX_PATTERN = /จำกัด/g;
const DECIMAL_RADIX = 10;
/** Bulk check-weight processing runs many writes in one transaction — allow more than Prisma's 5s default. */
const BULK_TRANSACTION_TIMEOUT_MS = 30_000;

const CHECK_WEIGHT_DETAIL_SELECT = {
  checkWeightID: true,
  jobID: true,
  staffID: true,
  staffName: true,
  status: true,
  supplierName: true,
  time: true,
  noOfBags: true,
  grossWeight: true,
  netWeightW: true,
  netWeightTon: true,
  totalGrossWeight: true,
  totalNetWeight: true,
  totalTareWeight: true,
  remainWeight: true,
  weightPerTon: true,
  goDown: true,
  loadingDetails: true,
  specialJob: true,
  statusContinue: true,
  note: true,
  vehicleName: true,
  riceName: true,
  quantity: true,
  descriptionID: true,
  requestID: true,
  description: { select: { destination: true, licenseDetailID: true } },
  request: { select: { licenseNumber: true, shippingDateTime: true, requestBy: true } },
} satisfies Prisma.validate_Check_WeightSelect;

const CHECK_WEIGHT_BY_DATE_INCLUDE = {
  request: {
    select: {
      licenseNumber: true,
      surveyLocateNameThai: true,
      surveyLocateNameEng: true,
      companyName: true,
    },
  },
  description: { select: { destination: true } },
} satisfies Prisma.validate_Check_WeightInclude;

type CheckWeightDetail = Prisma.validate_Check_WeightGetPayload<{ select: typeof CHECK_WEIGHT_DETAIL_SELECT }>;
type CheckWeightByDate = Prisma.validate_Check_WeightGetPayload<{ include: typeof CHECK_WEIGHT_BY_DATE_INCLUDE }>;
type CheckWeightWithRelations = Prisma.validate_Check_WeightGetPayload<{
  include: { request: true; description: true };
}>;
type CheckWeightWithRequest = Prisma.validate_Check_WeightGetPayload<{ include: { request: true } }>;

export interface MessageDataResponse<T> {
  message: string;
  data: T;
}

export type CheckWeightDetailResult = CheckWeightDetail & { remainNetWeightKGM: number | null };

export type CheckWeightByDateResult = Omit<CheckWeightByDate, 'request'> & {
  request: Partial<CheckWeightByDate['request']> & { companyName: string; companyNameEn: string };
};

export interface ProcessCheckWeightResult {
  message: string;
  updated: number;
  created: number;
}

@Injectable()
export class RecordnotificationService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Read ───────────────────────────────────────────────────────────────────

  async getCheckWeightById(checkWeightID: string): Promise<MessageDataResponse<CheckWeightDetailResult>> {
    console.log('[RecordnotificationService.getCheckWeightById] checkWeightID:', checkWeightID);
    try {
      const checkWeight = await this.prisma.validate_Check_Weight.findUnique({
        where: { checkWeightID },
        select: CHECK_WEIGHT_DETAIL_SELECT,
      });
      if (!checkWeight) throw new NotFoundException('No data found for the given check weight ID');

      const licenseDetailID = checkWeight.description?.licenseDetailID;
      const [bufferRemain, companyNameEn] = await Promise.all([
        licenseDetailID ? this.prisma.bufferRemain.findFirst({ where: { licenseDetailID } }) : null,
        this.findCompanyNameEn(checkWeight.supplierName),
      ]);

      const result: CheckWeightDetailResult = {
        ...checkWeight,
        supplierName: companyNameEn || checkWeight.supplierName,
        remainNetWeightKGM: bufferRemain?.remainNetWeightKGM ?? null,
      };
      console.log('[RecordnotificationService.getCheckWeightById] result:', result.checkWeightID);
      return { message: 'Check weight data retrieved successfully', data: result };
    } catch (error) {
      rethrowAsHttpException('RecordnotificationService.getCheckWeightById', error);
    }
  }

  async getCheckWeightsByDate(date: string): Promise<MessageDataResponse<CheckWeightByDateResult[]>> {
    console.log('[RecordnotificationService.getCheckWeightsByDate] date:', date);
    try {
      const checkWeights = await this.prisma.validate_Check_Weight.findMany({
        where: { request: { requestDate: this.buildDayRange(date) } },
        include: CHECK_WEIGHT_BY_DATE_INCLUDE,
        orderBy: [{ jobID: 'asc' }, { specialJob: 'asc' }],
      });
      if (checkWeights.length === 0) {
        throw new NotFoundException('No check weight data found for the given date');
      }

      const companyNamesTh = this.uniqueNonEmpty(checkWeights.map((cw) => cw.request?.companyName));
      const companyNameEnByTh = await this.buildCompanyNameEnMap(companyNamesTh);

      const result = checkWeights.map((checkWeight) => ({
        ...checkWeight,
        request: {
          ...checkWeight.request,
          companyName: this.stripCompanySuffix(checkWeight.request?.companyName),
          companyNameEn: companyNameEnByTh.get(checkWeight.request?.companyName ?? '') ?? '',
        },
      }));
      console.log('[RecordnotificationService.getCheckWeightsByDate] result count:', result.length);
      return { message: 'Check weight data retrieved successfully by date', data: result };
    } catch (error) {
      rethrowAsHttpException('RecordnotificationService.getCheckWeightsByDate', error);
    }
  }

  async getLicenseHistory(licenseNumber: string): Promise<LicenseHistoryResponse> {
    console.log('[RecordnotificationService.getLicenseHistory] licenseNumber:', licenseNumber);
    try {
      const result = await buildLicenseHistory(this.prisma, licenseNumber);
      console.log('[RecordnotificationService.getLicenseHistory] result groups:', result.data.length);
      return result;
    } catch (error) {
      rethrowAsHttpException('RecordnotificationService.getLicenseHistory', error);
    }
  }

  async getCheckWeightsByJobNoOrLicense(
    jobNo: string,
    licenseNumber: string,
  ): Promise<MessageDataResponse<CheckWeightWithRequest[]>> {
    console.log('[RecordnotificationService.getCheckWeightsByJobNoOrLicense] jobNo:', jobNo, 'licenseNumber:', licenseNumber);
    try {
      const jobID = parseInt(jobNo, DECIMAL_RADIX);
      const conditions: Prisma.validate_Check_WeightWhereInput[] = [
        { request: { licenseNumber } },
        ...(isNaN(jobID) ? [] : [{ jobID }]),
      ];

      const checkWeights = await this.prisma.validate_Check_Weight.findMany({
        where: { OR: conditions },
        include: { request: true },
      });
      if (checkWeights.length === 0) {
        throw new NotFoundException('No check weight data found for the given jobNo and licenseId');
      }
      console.log('[RecordnotificationService.getCheckWeightsByJobNoOrLicense] result count:', checkWeights.length);
      return {
        message: 'Check weight data retrieved successfully by jobNo and licenseId',
        data: checkWeights,
      };
    } catch (error) {
      rethrowAsHttpException('RecordnotificationService.getCheckWeightsByJobNoOrLicense', error);
    }
  }

  // ─── Write ──────────────────────────────────────────────────────────────────

  async updateCheckWeight(
    checkWeightID: string,
    dto: UpdateCheckWeightData,
  ): Promise<MessageDataResponse<validate_Check_Weight>> {
    console.log('[RecordnotificationService.updateCheckWeight] checkWeightID:', checkWeightID);
    try {
      const updatedCheckWeight = await this.prisma.$transaction(async (tx) => {
        const checkWeight = await tx.validate_Check_Weight.findUnique({
          where: { checkWeightID },
          include: { request: true, description: true },
        });
        if (!checkWeight) throw new NotFoundException('Check weight data not found');

        const licenseDetailID = checkWeight.description?.licenseDetailID;
        if (!licenseDetailID) throw new BadRequestException('Description has no licenseDetailID linked');

        const bufferRemain = await tx.bufferRemain.findFirst({ where: { licenseDetailID } });
        if (!bufferRemain) throw new NotFoundException('BufferRemain not found for this license detail');

        const newRemain = this.calculateNewRemain(
          checkWeight,
          bufferRemain.remainNetWeightKGM ?? 0,
          dto.totalNetWeight || 0,
        );

        const updated = await tx.validate_Check_Weight.update({ where: { checkWeightID }, data: dto });
        await tx.bufferRemain.update({
          where: { bufferRemainID: bufferRemain.bufferRemainID },
          data: { remainNetWeightKGM: newRemain },
        });
        await this.syncCertificateSheet(tx, checkWeight, updated);
        return updated;
      });

      console.log('[RecordnotificationService.updateCheckWeight] result:', updatedCheckWeight.checkWeightID);
      return {
        message: 'Check weight data and addcertificatesheet already updated successfully',
        data: updatedCheckWeight,
      };
    } catch (error) {
      rethrowAsHttpException('RecordnotificationService.updateCheckWeight', error);
    }
  }

  async processCheckWeights(dtoList: ValidateCheckWeightDto[]): Promise<ProcessCheckWeightResult> {
    console.log('[RecordnotificationService.processCheckWeights] count:', dtoList.length);
    try {
      const result = await this.prisma.$transaction(
        (tx) => this.processCheckWeightsInTransaction(tx, dtoList),
        { timeout: BULK_TRANSACTION_TIMEOUT_MS },
      );
      console.log('[RecordnotificationService.processCheckWeights] result:', result);
      return result;
    } catch (error) {
      rethrowAsHttpException('RecordnotificationService.processCheckWeights', error);
    }
  }

  // ─── Private helpers: processCheckWeights ───────────────────────────────────

  private async processCheckWeightsInTransaction(
    tx: Prisma.TransactionClient,
    dtoList: ValidateCheckWeightDto[],
  ): Promise<ProcessCheckWeightResult> {
    // Every incoming item is logged as a NotificationReceipt, whatever its jobName.
    const receiptIdByDescriptionId = await this.createNotificationReceipts(tx, dtoList);

    const checkWeightDtos = dtoList.filter((dto) => dto.jobName === CHECKWEIGHT_JOB_NAME);
    const descriptionIds = checkWeightDtos.map((dto) => dto.descriptionID);

    const [staffList, existingCheckWeights, requests, descriptions] = await Promise.all([
      tx.staff.findMany({ where: { staffID: { in: this.uniqueNonEmpty(checkWeightDtos.map((dto) => dto.staffID)) } } }),
      tx.validate_Check_Weight.findMany({
        where: { descriptionID: { in: descriptionIds } },
        select: { descriptionID: true, checkWeightID: true },
      }),
      tx.request.findMany({ where: { requestID: { in: checkWeightDtos.map((dto) => dto.requestID) } } }),
      tx.description.findMany({ where: { descriptionID: { in: descriptionIds } } }),
    ]);

    const staffNameById = new Map(staffList.map((staff) => [staff.staffID, staff.staffName]));
    const existingCheckWeightIdByDescriptionId = new Map(
      existingCheckWeights.map((cw) => [cw.descriptionID, cw.checkWeightID]),
    );
    const requestById = new Map(requests.map((request) => [request.requestID, request]));
    const descriptionById = new Map(descriptions.map((description) => [description.descriptionID, description]));

    const dtosToUpdate = checkWeightDtos.filter((dto) => existingCheckWeightIdByDescriptionId.has(dto.descriptionID));
    const dtosToCreate = checkWeightDtos.filter((dto) => !existingCheckWeightIdByDescriptionId.has(dto.descriptionID));

    for (const dto of dtosToUpdate) {
      await tx.validate_Check_Weight.updateMany({
        where: { descriptionID: dto.descriptionID },
        data: this.buildCheckWeightUpdateData(
          dto,
          staffNameById,
          descriptionById.get(dto.descriptionID),
          requestById.get(dto.requestID),
        ),
      });
    }

    const createdCheckWeights = await tx.validate_Check_Weight.createManyAndReturn({
      data: dtosToCreate.map((dto) =>
        this.buildCheckWeightCreateData(
          dto,
          staffNameById,
          descriptionById.get(dto.descriptionID),
          requestById.get(dto.requestID),
        ),
      ),
      select: { descriptionID: true, checkWeightID: true },
    });

    const checkWeightIdByDescriptionId = new Map([
      ...existingCheckWeightIdByDescriptionId,
      ...createdCheckWeights.map((cw): [string, string] => [cw.descriptionID, cw.checkWeightID]),
    ]);
    await this.linkReceiptsToCheckWeights(tx, checkWeightDtos, receiptIdByDescriptionId, checkWeightIdByDescriptionId);

    await tx.request.updateMany({
      where: { requestID: { in: dtoList.map((dto) => dto.requestID) } },
      data: { status: REQUEST_STATUS_COMPLETED },
    });

    const existingCount = existingCheckWeightIdByDescriptionId.size;
    return {
      message: 'Successfully processed check weight data',
      updated: existingCount,
      created: checkWeightDtos.length - existingCount,
    };
  }

  private async createNotificationReceipts(
    tx: Prisma.TransactionClient,
    dtoList: ValidateCheckWeightDto[],
  ): Promise<Map<string, string>> {
    const receipts = await tx.notificationReceipt.createManyAndReturn({
      data: dtoList.map((dto) => ({
        jobName: dto.jobName,
        staffID: dto.staffID,
        jobID: dto.jobID,
        specialJob: dto.specialJob,
        descriptionID: dto.descriptionID,
        requestID: dto.requestID,
      })),
      select: { descriptionID: true, notificationReceiptID: true },
    });
    return new Map(receipts.map((receipt) => [receipt.descriptionID, receipt.notificationReceiptID]));
  }

  private async linkReceiptsToCheckWeights(
    tx: Prisma.TransactionClient,
    checkWeightDtos: ValidateCheckWeightDto[],
    receiptIdByDescriptionId: Map<string, string>,
    checkWeightIdByDescriptionId: Map<string, string>,
  ): Promise<void> {
    for (const dto of checkWeightDtos) {
      const notificationReceiptID = receiptIdByDescriptionId.get(dto.descriptionID);
      const checkWeightID = checkWeightIdByDescriptionId.get(dto.descriptionID);
      if (!notificationReceiptID || !checkWeightID) continue;
      await tx.notificationReceipt.update({
        where: { notificationReceiptID },
        data: { checkWeightID },
      });
    }
  }

  private buildCheckWeightUpdateData(
    dto: ValidateCheckWeightDto,
    staffNameById: Map<string, string | null>,
    description: Description | undefined,
    request: Request | undefined,
  ): Prisma.validate_Check_WeightUpdateManyMutationInput {
    // Fields from description/request are only overwritten when the source row exists.
    return {
      status: false,
      staffID: dto.staffID,
      jobID: dto.jobID,
      note: dto.note,
      statusContinue: dto.statusContinue,
      staffName: this.resolveStaffName(dto, staffNameById),
      specialJob: dto.specialJob || null,
      ...(description && {
        vehicleName: description.vehicleName,
        riceName: description.riceType,
        noOfBags: description.quantity,
        grossWeight: description.grossWeight,
        netWeightW: description.netWeightW,
        netWeightTon: description.netWeightTON,
      }),
      ...(request && {
        goDown: request.portName,
        time: request.shippingDateTime,
        supplierName: request.companyName,
      }),
    };
  }

  private buildCheckWeightCreateData(
    dto: ValidateCheckWeightDto,
    staffNameById: Map<string, string | null>,
    description: Description | undefined,
    request: Request | undefined,
  ): Prisma.validate_Check_WeightCreateManyInput {
    return {
      descriptionID: dto.descriptionID,
      requestID: dto.requestID,
      status: false,
      staffID: dto.staffID,
      jobID: dto.jobID,
      note: dto.note,
      statusContinue: dto.statusContinue,
      staffName: this.resolveStaffName(dto, staffNameById),
      specialJob: dto.specialJob || null,
      vehicleName: description?.vehicleName || null,
      riceName: description?.riceType || null,
      noOfBags: description?.quantity || null,
      grossWeight: description?.grossWeight || null,
      netWeightW: description?.netWeightW || null,
      netWeightTon: description?.netWeightTON || null,
      goDown: request?.portName || null,
      time: request?.shippingDateTime || null,
      supplierName: request?.companyName || null,
    };
  }

  private resolveStaffName(dto: ValidateCheckWeightDto, staffNameById: Map<string, string | null>): string | null {
    return staffNameById.get(dto.staffID ?? '') ?? dto.staffName ?? null;
  }

  // ─── Private helpers: updateCheckWeight ─────────────────────────────────────

  /**
   * First update (status = false): subtract the whole new totalNetWeight.
   * Re-update (status = true): subtract only the difference from the previous totalNetWeight.
   */
  private calculateNewRemain(
    checkWeight: CheckWeightWithRelations,
    currentRemain: number,
    newTotalNetWeight: number,
  ): number {
    const isFirstUpdate = !checkWeight.status;

    if (isFirstUpdate && currentRemain <= 0) {
      throw new BadRequestException(
        'Cannot update check weight data because remainNetWeightKGM is zero or negative',
      );
    }

    const weightToSubtract = isFirstUpdate
      ? newTotalNetWeight
      : newTotalNetWeight - (checkWeight.totalNetWeight || 0);
    const newRemain = currentRemain - weightToSubtract;

    if (newRemain < 0) {
      throw new BadRequestException(
        isFirstUpdate
          ? 'Cannot update: totalNetWeight exceeds remaining remainNetWeightKGM'
          : 'Cannot update: adjusted totalNetWeight exceeds remaining remainNetWeightKGM',
      );
    }
    return newRemain;
  }

  private async syncCertificateSheet(
    tx: Prisma.TransactionClient,
    original: CheckWeightWithRelations,
    updated: validate_Check_Weight,
  ): Promise<void> {
    const weights = {
      totalGrossWeight: updated.totalGrossWeight || 0,
      totalTareWeight: updated.totalTareWeight || 0,
      totalNettWeight: updated.totalNetWeight || 0,
    };

    if (original.status) {
      await tx.certificatesheet.update({ where: { checkWeightID: updated.checkWeightID }, data: weights });
      return;
    }

    const { request, description } = original;
    await tx.certificatesheet.create({
      data: {
        ...weights,
        checkWeightID: updated.checkWeightID,
        jobID: original.jobID || 0,
        licenseNumber: request.licenseNumber || '',
        index: description?.index || 0,
        specialJob: original.specialJob || '',
        companyName: request.companyName || '',
        surveyLocateNameThai: request.surveyLocateNameThai || '',
        portName: request.portName || '',
        destination: description?.destination || '',
        riceType: description?.riceType || '',
        quantity: description?.quantity || 0,
        shipper: request.requestBy || '',
        dateCheckWeight: request.requestDate || new Date(),
        marks: DEFAULT_CERTIFICATE_MARKS,
        status: false,
        applyGodown: true,
      },
    });
  }

  // ─── Private helpers: shared ────────────────────────────────────────────────

  private async findCompanyNameEn(companyNameTh: string | null): Promise<string | null> {
    // Without a Thai name there is nothing to match — previously this matched an arbitrary company.
    if (!companyNameTh) return null;
    const company = await this.prisma.company.findFirst({
      where: { companyNameTH: companyNameTh },
      select: { companyNameEN: true },
    });
    return company?.companyNameEN ?? null;
  }

  private async buildCompanyNameEnMap(companyNamesTh: string[]): Promise<Map<string, string>> {
    const companies = await this.prisma.company.findMany({
      where: { companyNameTH: { in: companyNamesTh } },
      select: { companyNameTH: true, companyNameEN: true },
    });
    // Keep the first match per Thai name (same as the previous Array.find lookup).
    const companyNameEnByTh = new Map<string, string>();
    for (const company of companies) {
      if (!companyNameEnByTh.has(company.companyNameTH)) {
        companyNameEnByTh.set(company.companyNameTH, company.companyNameEN);
      }
    }
    return companyNameEnByTh;
  }

  private stripCompanySuffix(companyName: string | null | undefined): string {
    return companyName?.replace(COMPANY_SUFFIX_PATTERN, '').trim() || '';
  }

  private buildDayRange(date: string): { gte: Date; lt: Date } {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) throw new BadRequestException('Invalid date format');
    const year = parsed.getFullYear();
    const month = parsed.getMonth();
    const day = parsed.getDate();
    return { gte: new Date(year, month, day), lt: new Date(year, month, day + 1) };
  }

  private uniqueNonEmpty(values: (string | null | undefined)[]): string[] {
    return [...new Set(values.filter((value): value is string => Boolean(value)))];
  }
}
