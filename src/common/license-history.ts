import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

const UNKNOWN_LICENSE_DETAIL_ID = '__unknown__';

const LICENSE_HISTORY_SELECT = {
  jobID: true,
  quantity: true,
  totalNetWeight: true,
  loadingDetails: true,
  riceName: true,
  request: {
    select: {
      shippingDateTime: true,
      surveyProvince: true,
      surveyLocateNameThai: true,
      portName: true,
      requestBy: true,
    },
  },
  description: { select: { licenseDetailID: true, vehicleName: true } },
} satisfies Prisma.validate_Check_WeightSelect;

const GOVERNMENT_LICENSE_SELECT = {
  licenseNumber: true,
  exporter: true,
  expiredDate: true,
  currency: true,
  exchangeRate: true,
  destinationCountry: true,
  licenseDetails: {
    select: { licenseDetailID: true, netWeightTON: true, quantity: true, pricePerUnit: true },
  },
} satisfies Prisma.DataFromGovermentSelect;

type LicenseHistoryRow = Prisma.validate_Check_WeightGetPayload<{ select: typeof LICENSE_HISTORY_SELECT }>;
type GovernmentLicense = Prisma.DataFromGovermentGetPayload<{ select: typeof GOVERNMENT_LICENSE_SELECT }>;

interface BufferRemainSummary {
  remainNetWeightKGM: number | null;
  MaximumWeight: number | null;
}

export interface LicenseHistoryRecord {
  jobID: number | null;
  quantity: number | null;
  totalNetWeight: number | null;
  loadingDetails: string | null;
  riceName: string | null;
  vehicleName: string | undefined;
  shippingDateTime: Date | undefined;
  surveyProvince: string | undefined;
  surveyName: string | null | undefined;
  portName: string | null | undefined;
  requestBy: string | undefined;
}

export interface LicenseHistoryGroup {
  licenseIndex: number;
  licenseDetailID: string;
  remainNetWeightKGM: number | null;
  maximumWeight: number | null;
  records: LicenseHistoryRecord[];
}

export type GovernmentLicenseWithIndex = Omit<GovernmentLicense, 'licenseDetails'> & {
  licenseDetails: (GovernmentLicense['licenseDetails'][number] & { index: number })[];
};

export interface LicenseHistoryResponse {
  message: string;
  govData: GovernmentLicenseWithIndex | null;
  data: LicenseHistoryGroup[];
}

/**
 * Builds the license usage history: completed check weights of a license, grouped by license detail,
 * plus the government license header. Shared by the record-notification and certificate modules.
 *
 * @param extraWhere additional filter on validate_Check_Weight (e.g. only certified rows)
 */
export async function buildLicenseHistory(
  prisma: PrismaService,
  licenseNumber: string,
  extraWhere: Prisma.validate_Check_WeightWhereInput = {},
): Promise<LicenseHistoryResponse> {
  const historyRows = await prisma.validate_Check_Weight.findMany({
    where: { status: true, description: { licenseNumber }, ...extraWhere },
    select: LICENSE_HISTORY_SELECT,
    orderBy: { jobID: 'asc' },
  });

  const licenseDetailIds = uniqueNonEmpty(historyRows.map((row) => row.description?.licenseDetailID));
  const surveyNamesTh = uniqueNonEmpty(historyRows.map((row) => row.request?.surveyLocateNameThai));

  const [bufferRemains, surveyNames, governmentLicense] = await Promise.all([
    prisma.bufferRemain.findMany({ where: { licenseDetailID: { in: licenseDetailIds } } }),
    prisma.surveyName.findMany({
      where: { surveyNameTH: { in: surveyNamesTh } },
      select: { surveyNameTH: true, surveyNameEN: true },
    }),
    prisma.dataFromGoverment.findFirst({ where: { licenseNumber }, select: GOVERNMENT_LICENSE_SELECT }),
  ]);

  const bufferRemainById = new Map(bufferRemains.map((buffer) => [buffer.licenseDetailID, buffer]));
  const surveyNameEnByTh = new Map(surveyNames.map((survey) => [survey.surveyNameTH, survey.surveyNameEN]));

  return {
    message: 'License history retrieved successfully',
    govData: addIndexToLicenseDetails(governmentLicense),
    data: groupByLicenseDetail(historyRows, bufferRemainById, surveyNameEnByTh),
  };
}

function groupByLicenseDetail(
  historyRows: LicenseHistoryRow[],
  bufferRemainById: Map<string, BufferRemainSummary>,
  surveyNameEnByTh: Map<string, string | null>,
): LicenseHistoryGroup[] {
  const groupById = new Map<string, LicenseHistoryGroup>();

  for (const row of historyRows) {
    const licenseDetailID = row.description?.licenseDetailID ?? UNKNOWN_LICENSE_DETAIL_ID;
    let group = groupById.get(licenseDetailID);
    if (!group) {
      const bufferRemain = bufferRemainById.get(licenseDetailID);
      group = {
        licenseIndex: groupById.size + 1,
        licenseDetailID,
        remainNetWeightKGM: bufferRemain?.remainNetWeightKGM ?? null,
        maximumWeight: bufferRemain?.MaximumWeight ?? null,
        records: [],
      };
      groupById.set(licenseDetailID, group);
    }
    group.records.push(toHistoryRecord(row, surveyNameEnByTh));
  }
  return [...groupById.values()];
}

function toHistoryRecord(row: LicenseHistoryRow, surveyNameEnByTh: Map<string, string | null>): LicenseHistoryRecord {
  const surveyNameTh = row.request?.surveyLocateNameThai;
  return {
    jobID: row.jobID,
    quantity: row.quantity,
    totalNetWeight: row.totalNetWeight,
    loadingDetails: row.loadingDetails,
    riceName: row.riceName,
    vehicleName: row.description?.vehicleName,
    shippingDateTime: row.request?.shippingDateTime,
    surveyProvince: row.request?.surveyProvince,
    surveyName: surveyNameEnByTh.get(surveyNameTh ?? '') || surveyNameTh,
    portName: row.request?.portName,
    requestBy: row.request?.requestBy,
  };
}

function addIndexToLicenseDetails(license: GovernmentLicense | null): GovernmentLicenseWithIndex | null {
  if (!license) return null;
  return {
    ...license,
    licenseDetails: license.licenseDetails.map((detail, i) => ({ index: i + 1, ...detail })),
  };
}

function uniqueNonEmpty(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}
