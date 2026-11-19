import { Injectable } from '@nestjs/common';
import { Prisma, riceManage } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { rethrowAsHttpException } from 'src/common/service-error';

const BUDDHIST_ERA_OFFSET = 543;
const SHORT_YEAR_LENGTH = 2;
const SHORT_LICENSE_NO_LENGTH = 5;
const LOADING_KEYWORD = 'loading';
const CHECK_MARK = '✓';

const CHECK_WEIGHT_SELECT = {
  riceName: true,
  loadingDetails: true,
  jobID: true,
  time: true,
  request: {
    select: {
      licenseNumber: true,
      companyName: true,
      surveyLocateNameThai: true,
    },
  },
  description: {
    select: {
      index: true,
      destination: true,
      vehicleName: true,
      licenseDetailID: true,
      netWeightTON: true,
    },
  },
} satisfies Prisma.validate_Check_WeightSelect;

type CheckWeightRow = Prisma.validate_Check_WeightGetPayload<{
  select: typeof CHECK_WEIGHT_SELECT;
}>;

type RiceInfo = Pick<
  riceManage,
  'riceNameThai' | 'riceNameEng' | 'riceCodeT' | 'riceCode1' | 'riceCode2'
>;

interface LicensePrice {
  pricePerUnit: number | null;
  exchangeRate: number;
}

interface LookupMaps {
  licensePriceByDetailId: Map<string, LicensePrice>;
  surveyNameEnByTh: Map<string, string | null>;
  riceInfoByThaiName: Map<string, RiceInfo>;
}

/** One row of the statistic Excel sheet — keys are the Thai column headers used by the frontend. */
export type StatisticRow = Record<string, string | number | null | undefined>;

@Injectable()
export class StatisticService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatisticData(startDate: string, endDate: string): Promise<StatisticRow[]> {
    console.log('[StatisticService.getStatisticData] startDate:', startDate, 'endDate:', endDate);
    try {
      const checkWeights = await this.findCertifiedCheckWeights(startDate, endDate);
      const lookupMaps = await this.buildLookupMaps(checkWeights);
      const result = checkWeights.map((checkWeight, index) =>
        this.toStatisticRow(checkWeight, index, lookupMaps),
      );
      console.log('[StatisticService.getStatisticData] result count:', result.length);
      return result;
    } catch (error) {
      rethrowAsHttpException('StatisticService.getStatisticData', error);
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private findCertifiedCheckWeights(startDate: string, endDate: string): Promise<CheckWeightRow[]> {
    return this.prisma.validate_Check_Weight.findMany({
      where: {
        time: { gte: new Date(startDate), lte: new Date(endDate) },
        certificate: { status: true },
      },
      select: CHECK_WEIGHT_SELECT,
      orderBy: { time: 'asc' },
    });
  }

  private async buildLookupMaps(checkWeights: CheckWeightRow[]): Promise<LookupMaps> {
    const licenseNumbers = this.uniqueNonEmpty(checkWeights.map((cw) => cw.request?.licenseNumber));
    const surveyNamesTh = this.uniqueNonEmpty(checkWeights.map((cw) => cw.request?.surveyLocateNameThai));
    const riceNamesTh = this.uniqueNonEmpty(checkWeights.map((cw) => cw.riceName));

    const [licensePriceByDetailId, surveyNameEnByTh, riceInfoByThaiName] = await Promise.all([
      this.buildLicensePriceMap(licenseNumbers),
      this.buildSurveyNameMap(surveyNamesTh),
      this.buildRiceInfoMap(riceNamesTh),
    ]);
    return { licensePriceByDetailId, surveyNameEnByTh, riceInfoByThaiName };
  }

  private async buildLicensePriceMap(licenseNumbers: string[]): Promise<Map<string, LicensePrice>> {
    const governmentLicenses = await this.prisma.dataFromGoverment.findMany({
      where: { licenseNumber: { in: licenseNumbers } },
      select: {
        exchangeRate: true,
        licenseDetails: { select: { licenseDetailID: true, pricePerUnit: true } },
      },
    });
    return new Map(
      governmentLicenses.flatMap((license) =>
        license.licenseDetails.map((detail): [string, LicensePrice] => [
          detail.licenseDetailID,
          { pricePerUnit: detail.pricePerUnit, exchangeRate: license.exchangeRate },
        ]),
      ),
    );
  }

  private async buildSurveyNameMap(surveyNamesTh: string[]): Promise<Map<string, string | null>> {
    const surveyNames = await this.prisma.surveyName.findMany({
      where: { surveyNameTH: { in: surveyNamesTh } },
      select: { surveyNameTH: true, surveyNameEN: true },
    });
    return new Map(surveyNames.map((survey) => [survey.surveyNameTH, survey.surveyNameEN]));
  }

  private async buildRiceInfoMap(riceNamesTh: string[]): Promise<Map<string, RiceInfo>> {
    const riceList = await this.prisma.riceManage.findMany({
      where: { riceNameThai: { in: riceNamesTh } },
      select: {
        riceNameThai: true,
        riceNameEng: true,
        riceCodeT: true,
        riceCode1: true,
        riceCode2: true,
      },
    });
    return new Map(
      riceList
        .filter((rice): rice is RiceInfo & { riceNameThai: string } => Boolean(rice.riceNameThai))
        .map((rice) => [rice.riceNameThai, rice]),
    );
  }

  private toStatisticRow(checkWeight: CheckWeightRow, index: number, maps: LookupMaps): StatisticRow {
    const { request, description } = checkWeight;
    const licensePrice = description?.licenseDetailID
      ? maps.licensePriceByDetailId.get(description.licenseDetailID)
      : null;
    const surveyNameTh = request?.surveyLocateNameThai || null;
    const surveyNameEn = surveyNameTh ? maps.surveyNameEnByTh.get(surveyNameTh) : null;
    const riceInfo = checkWeight.riceName ? maps.riceInfoByThaiName.get(checkWeight.riceName) : null;

    return {
      'ลำดับที่': index + 1,
      'ผู้ได้รับอนุญาติส่งออก': request?.companyName || null,
      'ผู้ส่งมอบ': surveyNameEn || surveyNameTh,
      'เข้าตู้': checkWeight.loadingDetails?.toLowerCase().includes(LOADING_KEYWORD) ? CHECK_MARK : '',
      'รายการที่': description?.index || null,
      'ปี': this.toShortBuddhistYear(checkWeight.time),
      'เลขใบอนุญาต': request?.licenseNumber?.slice(-SHORT_LICENSE_NO_LENGTH) || null,
      'คำสั่งจ่างงานที่': checkWeight.jobID,
      'เรือใหญ่': description?.vehicleName,
      'เมืองตราส่ง': description?.destination,
      'ชนิดข้าว EN': riceInfo?.riceNameEng || null,
      'ปริมาณต่อตัน': description?.netWeightTON || null,
      T: riceInfo?.riceCodeT || null,
      'CODE 1': riceInfo?.riceCode1 || null,
      '(Space1)': null,
      'CODE 2': riceInfo?.riceCode2 || null,
      '(Space2)': null,
      'ราคา': licensePrice?.pricePerUnit ?? null,
      'อัตราแลกเปลี่ยน': licensePrice?.exchangeRate ?? null,
      'ชื่อข้าวไทย': checkWeight.riceName,
    };
  }

  private toShortBuddhistYear(date: Date | null): string | null {
    if (!date) return null;
    return (date.getFullYear() + BUDDHIST_ERA_OFFSET).toString().slice(-SHORT_YEAR_LENGTH);
  }

  private uniqueNonEmpty(values: (string | null | undefined)[]): string[] {
    return [...new Set(values.filter((value): value is string => Boolean(value)))];
  }
}
