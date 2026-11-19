import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Company, Prisma, goDownGroup, packing, riceManage, staff, surveyName } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { rethrowAsHttpException } from 'src/common/service-error';
import { CreateCompanyDto, UpdateCompanyDto } from 'src/dto/company.dto';
import { CreateGoDownGroupDto, UpdateGoDownGroupDto } from 'src/dto/goDownGroup.dto';
import { CreatePackingDto, UpdatePackingDto } from 'src/dto/packing.dto';
import { CreateRiceManageDto, UpdateRiceManageDto } from 'src/dto/rice.dto';
import { CreateStaffDto, CreateSurveyDto, UpdateStaffDto, UpdateSurveyNameDto } from 'src/dto/user.dto';

const INSENSITIVE = 'insensitive' as const;
const MIN_POSITIVE_INTEGER = 1;

const STAFF_SELECT = {
  staffID: true,
  staffNo: true,
  staffName: true,
  email: true,
  phone: true,
  position: true,
} satisfies Prisma.staffSelect;

const COMPANY_SELECT = {
  companyID: true,
  companyNameEN: true,
  companyNameTH: true,
  companyDescription: true,
} satisfies Prisma.CompanySelect;

const PACKING_SUMMARY_SELECT = { packingID: true, packingName: true, unit: true } satisfies Prisma.packingSelect;
const GODOWN_GROUP_SUMMARY_SELECT = {
  goDownGroupID: true,
  goDownGroupName: true,
  goDownColor: true,
} satisfies Prisma.goDownGroupSelect;
const SURVEY_NAME_SUMMARY_SELECT = {
  surveyNameID: true,
  changwat: true,
  surveyNameEN: true,
  surveyNameTH: true,
} satisfies Prisma.surveyNameSelect;

export type StaffSummary = Prisma.staffGetPayload<{ select: typeof STAFF_SELECT }>;
export type CompanySummary = Prisma.CompanyGetPayload<{ select: typeof COMPANY_SELECT }>;
export type PackingSummary = Prisma.packingGetPayload<{ select: typeof PACKING_SUMMARY_SELECT }>;
export type GoDownGroupSummary = Prisma.goDownGroupGetPayload<{ select: typeof GODOWN_GROUP_SUMMARY_SELECT }>;
export type SurveyNameSummary = Prisma.surveyNameGetPayload<{ select: typeof SURVEY_NAME_SUMMARY_SELECT }>;
export type GoDownGroupWithSurveys = Prisma.goDownGroupGetPayload<{ include: { surveyNames: true } }>;

export interface MessageResponse {
  message: string;
}

export interface MessageDataResponse<T> extends MessageResponse {
  data: T;
}

export interface PaginatedResponse<T> extends MessageDataResponse<T[]> {
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Rice ───────────────────────────────────────────────────────────────────

  async createRice(dto: CreateRiceManageDto): Promise<MessageDataResponse<riceManage>> {
    console.log('[AdminService.createRice] riceNameEng:', dto.riceNameEng);
    try {
      const rice = await this.prisma.riceManage.create({ data: dto });
      console.log('[AdminService.createRice] result:', rice.riceManageID);
      return { message: 'Created rice data complete', data: rice };
    } catch (error) {
      rethrowAsHttpException('AdminService.createRice', error);
    }
  }

  async createManyRice(dtoList: CreateRiceManageDto[]): Promise<{ result: string; data: Prisma.BatchPayload }> {
    console.log('[AdminService.createManyRice] count:', dtoList.length);
    try {
      const batch = await this.prisma.riceManage.createMany({ data: dtoList, skipDuplicates: true });
      console.log('[AdminService.createManyRice] result created:', batch.count);
      return { result: 'Created rice data complete', data: batch };
    } catch (error) {
      rethrowAsHttpException('AdminService.createManyRice', error);
    }
  }

  async getAllRice(): Promise<riceManage[]> {
    console.log('[AdminService.getAllRice]');
    try {
      const riceList = await this.prisma.riceManage.findMany({ orderBy: { riceNameEng: 'asc' } });
      console.log('[AdminService.getAllRice] result count:', riceList.length);
      return riceList;
    } catch (error) {
      rethrowAsHttpException('AdminService.getAllRice', error);
    }
  }

  async getRiceById(id: string): Promise<riceManage> {
    console.log('[AdminService.getRiceById] id:', id);
    try {
      const rice = await this.findRiceOrThrow(id);
      console.log('[AdminService.getRiceById] result:', rice.riceManageID);
      return rice;
    } catch (error) {
      rethrowAsHttpException('AdminService.getRiceById', error);
    }
  }

  async updateRice(id: string, dto: UpdateRiceManageDto): Promise<riceManage> {
    console.log('[AdminService.updateRice] id:', id);
    try {
      await this.findRiceOrThrow(id);
      const rice = await this.prisma.riceManage.update({ where: { riceManageID: id }, data: dto });
      console.log('[AdminService.updateRice] result:', rice.riceManageID);
      return rice;
    } catch (error) {
      rethrowAsHttpException('AdminService.updateRice', error);
    }
  }

  async deleteRice(id: string): Promise<MessageResponse> {
    console.log('[AdminService.deleteRice] id:', id);
    try {
      await this.findRiceOrThrow(id);
      await this.prisma.riceManage.delete({ where: { riceManageID: id } });
      console.log('[AdminService.deleteRice] result deleted:', id);
      return { message: 'Rice deleted successfully' };
    } catch (error) {
      rethrowAsHttpException('AdminService.deleteRice', error);
    }
  }

  /** Matches ANY of the given fields (OR), case-insensitive partial match. */
  async searchRice(riceNameEng?: string, riceNameThai?: string, riceType?: string): Promise<riceManage[]> {
    console.log('[AdminService.searchRice] riceNameEng:', riceNameEng, 'riceNameThai:', riceNameThai, 'riceType:', riceType);
    try {
      const conditions: Prisma.riceManageWhereInput[] = [
        ...(riceNameEng ? [{ riceNameEng: { contains: riceNameEng, mode: INSENSITIVE } }] : []),
        ...(riceNameThai ? [{ riceNameThai: { contains: riceNameThai, mode: INSENSITIVE } }] : []),
        ...(riceType ? [{ riceType: { contains: riceType, mode: INSENSITIVE } }] : []),
      ];
      const riceList = await this.prisma.riceManage.findMany({
        where: conditions.length > 0 ? { OR: conditions } : {},
        orderBy: { riceNameEng: 'asc' },
      });
      console.log('[AdminService.searchRice] result count:', riceList.length);
      return riceList;
    } catch (error) {
      rethrowAsHttpException('AdminService.searchRice', error);
    }
  }

  // ─── Staff ──────────────────────────────────────────────────────────────────

  async createStaff(dto: CreateStaffDto): Promise<staff> {
    console.log('[AdminService.createStaff] email:', dto.email);
    try {
      const lastStaff = await this.prisma.staff.findFirst({
        orderBy: { staffNo: 'desc' },
        select: { staffNo: true },
      });
      const createdStaff = await this.prisma.staff.create({
        data: {
          staffNo: (lastStaff?.staffNo ?? 0) + 1,
          staffName: dto.staffName,
          email: dto.email,
          phone: dto.phone,
          position: dto.position,
        },
      });
      console.log('[AdminService.createStaff] result:', createdStaff.staffID);
      return createdStaff;
    } catch (error) {
      rethrowAsHttpException('AdminService.createStaff', error);
    }
  }

  async getAllStaff(): Promise<StaffSummary[]> {
    console.log('[AdminService.getAllStaff]');
    try {
      const staffList = await this.prisma.staff.findMany({ orderBy: { staffNo: 'asc' }, select: STAFF_SELECT });
      console.log('[AdminService.getAllStaff] result count:', staffList.length);
      return staffList;
    } catch (error) {
      rethrowAsHttpException('AdminService.getAllStaff', error);
    }
  }

  async getStaffById(id: string): Promise<StaffSummary> {
    console.log('[AdminService.getStaffById] id:', id);
    try {
      const staffMember = await this.prisma.staff.findUnique({ where: { staffID: id }, select: STAFF_SELECT });
      if (!staffMember) throw new NotFoundException('Staff not found');
      console.log('[AdminService.getStaffById] result:', staffMember.staffID);
      return staffMember;
    } catch (error) {
      rethrowAsHttpException('AdminService.getStaffById', error);
    }
  }

  async updateStaff(id: string, dto: UpdateStaffDto): Promise<staff> {
    console.log('[AdminService.updateStaff] id:', id);
    try {
      await this.findStaffOrThrow(id);
      const updatedStaff = await this.prisma.staff.update({ where: { staffID: id }, data: dto });
      console.log('[AdminService.updateStaff] result:', updatedStaff.staffID);
      return updatedStaff;
    } catch (error) {
      rethrowAsHttpException('AdminService.updateStaff', error);
    }
  }

  async deleteStaff(id: string): Promise<MessageResponse> {
    console.log('[AdminService.deleteStaff] id:', id);
    try {
      await this.findStaffOrThrow(id);
      await this.prisma.staff.delete({ where: { staffID: id } });
      console.log('[AdminService.deleteStaff] result deleted:', id);
      return { message: 'Staff deleted successfully' };
    } catch (error) {
      rethrowAsHttpException('AdminService.deleteStaff', error);
    }
  }

  /** staffNo must match exactly; name/surname words match staffName partially (any word). */
  async searchStaff(
    staffNo?: string,
    staffName?: string,
    staffSurname?: string,
  ): Promise<MessageDataResponse<staff[]>> {
    console.log('[AdminService.searchStaff] staffNo:', staffNo, 'staffName:', staffName, 'staffSurname:', staffSurname);
    try {
      const staffList = await this.prisma.staff.findMany({
        where: this.buildStaffSearchWhere(staffNo, staffName, staffSurname),
        orderBy: { createdAt: 'desc' },
      });
      console.log('[AdminService.searchStaff] result count:', staffList.length);
      return { message: 'Search staff success', data: staffList };
    } catch (error) {
      rethrowAsHttpException('AdminService.searchStaff', error);
    }
  }

  // ─── Packing ────────────────────────────────────────────────────────────────

  async createPacking(dto: CreatePackingDto): Promise<MessageDataResponse<packing>> {
    console.log('[AdminService.createPacking] packingName:', dto.packingName);
    try {
      const createdPacking = await this.prisma.packing.create({ data: dto });
      console.log('[AdminService.createPacking] result:', createdPacking.packingID);
      return { message: 'Created packing data complete', data: createdPacking };
    } catch (error) {
      rethrowAsHttpException('AdminService.createPacking', error);
    }
  }

  async createManyPacking(dtoList: CreatePackingDto[]): Promise<MessageDataResponse<Prisma.BatchPayload>> {
    console.log('[AdminService.createManyPacking] count:', dtoList.length);
    try {
      const batch = await this.prisma.packing.createMany({ data: dtoList, skipDuplicates: true });
      console.log('[AdminService.createManyPacking] result created:', batch.count);
      return { message: 'Created packing data complete', data: batch };
    } catch (error) {
      rethrowAsHttpException('AdminService.createManyPacking', error);
    }
  }

  async getAllPacking(): Promise<MessageDataResponse<PackingSummary[]>> {
    console.log('[AdminService.getAllPacking]');
    try {
      const packingList = await this.prisma.packing.findMany({
        orderBy: { createdAt: 'desc' },
        select: PACKING_SUMMARY_SELECT,
      });
      console.log('[AdminService.getAllPacking] result count:', packingList.length);
      return { message: 'Get all packing data complete', data: packingList };
    } catch (error) {
      rethrowAsHttpException('AdminService.getAllPacking', error);
    }
  }

  async getPackingById(id: string): Promise<MessageDataResponse<packing>> {
    console.log('[AdminService.getPackingById] id:', id);
    try {
      const foundPacking = await this.findPackingOrThrow(id);
      console.log('[AdminService.getPackingById] result:', foundPacking.packingID);
      return { message: 'Get packing data complete', data: foundPacking };
    } catch (error) {
      rethrowAsHttpException('AdminService.getPackingById', error);
    }
  }

  async updatePacking(id: string, dto: UpdatePackingDto): Promise<MessageDataResponse<packing>> {
    console.log('[AdminService.updatePacking] id:', id);
    try {
      await this.findPackingOrThrow(id);
      const updatedPacking = await this.prisma.packing.update({ where: { packingID: id }, data: dto });
      console.log('[AdminService.updatePacking] result:', updatedPacking.packingID);
      return { message: 'Updated packing data complete', data: updatedPacking };
    } catch (error) {
      rethrowAsHttpException('AdminService.updatePacking', error);
    }
  }

  async deletePacking(id: string): Promise<MessageResponse> {
    console.log('[AdminService.deletePacking] id:', id);
    try {
      await this.findPackingOrThrow(id);
      await this.prisma.packing.delete({ where: { packingID: id } });
      console.log('[AdminService.deletePacking] result deleted:', id);
      return { message: 'Packing deleted successfully' };
    } catch (error) {
      rethrowAsHttpException('AdminService.deletePacking', error);
    }
  }

  /** Matches ALL given fields (AND), case-insensitive partial match. */
  async searchPacking(packingName?: string, unit?: string): Promise<MessageDataResponse<packing[]>> {
    console.log('[AdminService.searchPacking] packingName:', packingName, 'unit:', unit);
    try {
      const conditions: Prisma.packingWhereInput[] = [
        ...(packingName ? [{ packingName: { contains: packingName, mode: INSENSITIVE } }] : []),
        ...(unit ? [{ unit: { contains: unit, mode: INSENSITIVE } }] : []),
      ];
      const packingList = await this.prisma.packing.findMany({
        where: conditions.length > 0 ? { AND: conditions } : {},
        orderBy: { createdAt: 'desc' },
      });
      console.log('[AdminService.searchPacking] result count:', packingList.length);
      return { message: 'Search packing success', data: packingList };
    } catch (error) {
      rethrowAsHttpException('AdminService.searchPacking', error);
    }
  }

  // ─── Company ────────────────────────────────────────────────────────────────

  async getAllCompanies(): Promise<MessageDataResponse<CompanySummary[]>> {
    console.log('[AdminService.getAllCompanies]');
    try {
      const companies = await this.prisma.company.findMany({ orderBy: { createdAt: 'desc' }, select: COMPANY_SELECT });
      console.log('[AdminService.getAllCompanies] result count:', companies.length);
      return { message: 'Get company data complete', data: companies };
    } catch (error) {
      rethrowAsHttpException('AdminService.getAllCompanies', error);
    }
  }

  async getCompanyById(id: string): Promise<MessageDataResponse<Company>> {
    console.log('[AdminService.getCompanyById] id:', id);
    try {
      const company = await this.findCompanyOrThrow(id);
      console.log('[AdminService.getCompanyById] result:', company.companyID);
      return { message: 'Get company data complete', data: company };
    } catch (error) {
      rethrowAsHttpException('AdminService.getCompanyById', error);
    }
  }

  async createCompany(dto: CreateCompanyDto): Promise<MessageDataResponse<Company>> {
    console.log('[AdminService.createCompany] companyNameTH:', dto.companyNameTH);
    try {
      const company = await this.prisma.company.create({ data: dto });
      console.log('[AdminService.createCompany] result:', company.companyID);
      return { message: 'Created company data complete', data: company };
    } catch (error) {
      rethrowAsHttpException('AdminService.createCompany', error);
    }
  }

  async updateCompany(id: string, dto: UpdateCompanyDto): Promise<MessageDataResponse<Company>> {
    console.log('[AdminService.updateCompany] id:', id);
    try {
      await this.findCompanyOrThrow(id);
      const company = await this.prisma.company.update({ where: { companyID: id }, data: dto });
      console.log('[AdminService.updateCompany] result:', company.companyID);
      return { message: 'Updated company data complete', data: company };
    } catch (error) {
      rethrowAsHttpException('AdminService.updateCompany', error);
    }
  }

  async deleteCompany(id: string): Promise<MessageResponse> {
    console.log('[AdminService.deleteCompany] id:', id);
    try {
      await this.findCompanyOrThrow(id);
      await this.prisma.company.delete({ where: { companyID: id } });
      console.log('[AdminService.deleteCompany] result deleted:', id);
      return { message: 'Company deleted successfully' };
    } catch (error) {
      rethrowAsHttpException('AdminService.deleteCompany', error);
    }
  }

  /** Partial match on the English name (case-insensitive) or the Thai name. */
  async searchCompanies(companyName?: string): Promise<MessageDataResponse<Company[]>> {
    console.log('[AdminService.searchCompanies] companyName:', companyName);
    try {
      const companies = await this.prisma.company.findMany({
        where: companyName
          ? {
              OR: [
                { companyNameEN: { contains: companyName, mode: INSENSITIVE } },
                { companyNameTH: { contains: companyName } },
              ],
            }
          : {},
        orderBy: { createdAt: 'desc' },
      });
      console.log('[AdminService.searchCompanies] result count:', companies.length);
      return { message: 'Search company success', data: companies };
    } catch (error) {
      rethrowAsHttpException('AdminService.searchCompanies', error);
    }
  }

  // ─── SurveyName ─────────────────────────────────────────────────────────────

  async getAllSurveyNames(pageParam: string, limitParam: string): Promise<PaginatedResponse<surveyName>> {
    console.log('[AdminService.getAllSurveyNames] page:', pageParam, 'limit:', limitParam);
    try {
      const page = this.parsePositiveInteger(pageParam, 'page');
      const limit = this.parsePositiveInteger(limitParam, 'limit');

      const [surveyNames, total] = await Promise.all([
        this.prisma.surveyName.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { changwat: 'asc' } }),
        this.prisma.surveyName.count(),
      ]);
      console.log('[AdminService.getAllSurveyNames] result count:', surveyNames.length, 'total:', total);
      return {
        message: 'Get all survey name data complete',
        data: surveyNames,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      rethrowAsHttpException('AdminService.getAllSurveyNames', error);
    }
  }

  async getSurveyNameById(id: string): Promise<MessageDataResponse<surveyName>> {
    console.log('[AdminService.getSurveyNameById] id:', id);
    try {
      const survey = await this.findSurveyNameOrThrow(id);
      console.log('[AdminService.getSurveyNameById] result:', survey.surveyNameID);
      return { message: 'Get survey name data complete', data: survey };
    } catch (error) {
      rethrowAsHttpException('AdminService.getSurveyNameById', error);
    }
  }

  async createSurveyName(dto: CreateSurveyDto): Promise<MessageDataResponse<surveyName>> {
    console.log('[AdminService.createSurveyName] surveyNameTH:', dto.surveyNameTH);
    try {
      const survey = await this.prisma.surveyName.create({ data: dto });
      console.log('[AdminService.createSurveyName] result:', survey.surveyNameID);
      return { message: 'Created survey name data complete', data: survey };
    } catch (error) {
      rethrowAsHttpException('AdminService.createSurveyName', error);
    }
  }

  async updateSurveyName(id: string, dto: UpdateSurveyNameDto): Promise<MessageDataResponse<surveyName>> {
    console.log('[AdminService.updateSurveyName] id:', id);
    try {
      await this.findSurveyNameOrThrow(id);
      const survey = await this.prisma.surveyName.update({ where: { surveyNameID: id }, data: dto });
      console.log('[AdminService.updateSurveyName] result:', survey.surveyNameID);
      return { message: 'Updated survey name data complete', data: survey };
    } catch (error) {
      rethrowAsHttpException('AdminService.updateSurveyName', error);
    }
  }

  async deleteSurveyName(id: string): Promise<MessageResponse> {
    console.log('[AdminService.deleteSurveyName] id:', id);
    try {
      await this.findSurveyNameOrThrow(id);
      await this.prisma.surveyName.delete({ where: { surveyNameID: id } });
      console.log('[AdminService.deleteSurveyName] result deleted:', id);
      return { message: 'Survey name deleted successfully' };
    } catch (error) {
      rethrowAsHttpException('AdminService.deleteSurveyName', error);
    }
  }

  /** Matches ALL given fields (AND), case-insensitive partial match. */
  async searchSurveyNames(changwat?: string, amphoe?: string): Promise<MessageDataResponse<SurveyNameSummary[]>> {
    console.log('[AdminService.searchSurveyNames] changwat:', changwat, 'amphoe:', amphoe);
    try {
      const conditions: Prisma.surveyNameWhereInput[] = [
        ...(changwat ? [{ changwat: { contains: changwat, mode: INSENSITIVE } }] : []),
        ...(amphoe ? [{ amphoes: { contains: amphoe, mode: INSENSITIVE } }] : []),
      ];
      const surveyNames = await this.prisma.surveyName.findMany({
        where: conditions.length > 0 ? { AND: conditions } : {},
        orderBy: { changwat: 'asc' },
        select: SURVEY_NAME_SUMMARY_SELECT,
      });
      console.log('[AdminService.searchSurveyNames] result count:', surveyNames.length);
      return { message: 'Search survey name success', data: surveyNames };
    } catch (error) {
      rethrowAsHttpException('AdminService.searchSurveyNames', error);
    }
  }

  // ─── GoDownGroup ────────────────────────────────────────────────────────────

  async getAllGoDownGroups(): Promise<MessageDataResponse<GoDownGroupSummary[]>> {
    console.log('[AdminService.getAllGoDownGroups]');
    try {
      const groups = await this.prisma.goDownGroup.findMany({
        orderBy: { createdAt: 'desc' },
        select: GODOWN_GROUP_SUMMARY_SELECT,
      });
      console.log('[AdminService.getAllGoDownGroups] result count:', groups.length);
      return { message: 'Get all goDownGroup data complete', data: groups };
    } catch (error) {
      rethrowAsHttpException('AdminService.getAllGoDownGroups', error);
    }
  }

  async getGoDownGroupById(id: string): Promise<MessageDataResponse<GoDownGroupWithSurveys>> {
    console.log('[AdminService.getGoDownGroupById] id:', id);
    try {
      const group = await this.prisma.goDownGroup.findUnique({
        where: { goDownGroupID: id },
        include: { surveyNames: true },
      });
      if (!group) throw new NotFoundException('GoDownGroup not found');
      console.log('[AdminService.getGoDownGroupById] result:', group.goDownGroupID);
      return { message: 'Get goDownGroup data complete', data: group };
    } catch (error) {
      rethrowAsHttpException('AdminService.getGoDownGroupById', error);
    }
  }

  async createGoDownGroup(dto: CreateGoDownGroupDto): Promise<MessageDataResponse<goDownGroup>> {
    console.log('[AdminService.createGoDownGroup] goDownGroupName:', dto.goDownGroupName);
    try {
      const group = await this.prisma.goDownGroup.create({ data: dto });
      console.log('[AdminService.createGoDownGroup] result:', group.goDownGroupID);
      return { message: 'Created goDownGroup data complete', data: group };
    } catch (error) {
      rethrowAsHttpException('AdminService.createGoDownGroup', error);
    }
  }

  async updateGoDownGroup(id: string, dto: UpdateGoDownGroupDto): Promise<MessageDataResponse<goDownGroup>> {
    console.log('[AdminService.updateGoDownGroup] id:', id);
    try {
      await this.findGoDownGroupOrThrow(id);
      const group = await this.prisma.goDownGroup.update({ where: { goDownGroupID: id }, data: dto });
      console.log('[AdminService.updateGoDownGroup] result:', group.goDownGroupID);
      return { message: 'Updated goDownGroup data complete', data: group };
    } catch (error) {
      rethrowAsHttpException('AdminService.updateGoDownGroup', error);
    }
  }

  async deleteGoDownGroup(id: string): Promise<MessageResponse> {
    console.log('[AdminService.deleteGoDownGroup] id:', id);
    try {
      await this.findGoDownGroupOrThrow(id);
      await this.prisma.goDownGroup.delete({ where: { goDownGroupID: id } });
      console.log('[AdminService.deleteGoDownGroup] result deleted:', id);
      return { message: 'GoDownGroup deleted successfully' };
    } catch (error) {
      rethrowAsHttpException('AdminService.deleteGoDownGroup', error);
    }
  }

  async searchGoDownGroups(goDownGroupName?: string): Promise<MessageDataResponse<goDownGroup[]>> {
    console.log('[AdminService.searchGoDownGroups] goDownGroupName:', goDownGroupName);
    try {
      const groups = await this.prisma.goDownGroup.findMany({
        where: goDownGroupName ? { goDownGroupName: { contains: goDownGroupName, mode: INSENSITIVE } } : {},
        orderBy: { createdAt: 'desc' },
      });
      console.log('[AdminService.searchGoDownGroups] result count:', groups.length);
      return { message: 'Search goDownGroup success', data: groups };
    } catch (error) {
      rethrowAsHttpException('AdminService.searchGoDownGroups', error);
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async findRiceOrThrow(id: string): Promise<riceManage> {
    const rice = await this.prisma.riceManage.findUnique({ where: { riceManageID: id } });
    if (!rice) throw new NotFoundException('Rice not found');
    return rice;
  }

  private async findStaffOrThrow(id: string): Promise<staff> {
    const staffMember = await this.prisma.staff.findUnique({ where: { staffID: id } });
    if (!staffMember) throw new NotFoundException('Staff not found');
    return staffMember;
  }

  private async findPackingOrThrow(id: string): Promise<packing> {
    const foundPacking = await this.prisma.packing.findUnique({ where: { packingID: id } });
    if (!foundPacking) throw new NotFoundException('Packing not found');
    return foundPacking;
  }

  private async findCompanyOrThrow(id: string): Promise<Company> {
    const company = await this.prisma.company.findUnique({ where: { companyID: id } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  private async findSurveyNameOrThrow(id: string): Promise<surveyName> {
    const survey = await this.prisma.surveyName.findUnique({ where: { surveyNameID: id } });
    if (!survey) throw new NotFoundException('Survey name not found');
    return survey;
  }

  private async findGoDownGroupOrThrow(id: string): Promise<goDownGroup> {
    const group = await this.prisma.goDownGroup.findUnique({ where: { goDownGroupID: id } });
    if (!group) throw new NotFoundException('GoDownGroup not found');
    return group;
  }

  private buildStaffSearchWhere(
    staffNo?: string,
    staffName?: string,
    staffSurname?: string,
  ): Prisma.staffWhereInput {
    const conditions: Prisma.staffWhereInput[] = [];

    const staffNumber = Number(staffNo);
    if (staffNo && !isNaN(staffNumber)) conditions.push({ staffNo: staffNumber });

    const fullName = [staffName, staffSurname]
      .filter((part) => part && part.trim() !== '')
      .join(' ')
      .trim();
    if (fullName) {
      const words = fullName.split(/\s+/);
      conditions.push({
        OR: [fullName, ...words].map((term) => ({ staffName: { contains: term, mode: INSENSITIVE } })),
      });
    }
    return conditions.length > 0 ? { AND: conditions } : {};
  }

  private parsePositiveInteger(value: string, fieldName: string): number {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < MIN_POSITIVE_INTEGER) {
      throw new BadRequestException(`${fieldName} must be a positive integer`);
    }
    return parsed;
  }
}
