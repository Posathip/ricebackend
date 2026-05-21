import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from 'src/dto/company.dto';
import { CreatePackingDto, UpdatePackingDto } from 'src/dto/packing.dto';
import { CreateRiceManageDto, UpdateRiceManageDto } from 'src/dto/rice.dto';
import {
  CreateStaffDto,
  CreateSurveyDto,
  UpdateStaffDto,
  UpdateSurveyNameDto,
} from 'src/dto/user.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // ─── Rice ───────────────────────────────────────────────────────────────────

  async createRice(
    dto: CreateRiceManageDto,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[AdminService.createRice] dto:', dto);
    try {
      const newRice = await this.prisma.riceManage.create({ data: dto });
      // console.log('[AdminService.createRice] created riceManageID:', newRice.riceManageID);
      return response.status(201).send({ message: 'Created rice data complete', data: newRice });
    } catch (error) {
      console.error('[AdminService.createRice]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async getAllRice(request: any, response: any): Promise<void> {
    // console.log('[AdminService.getAllRice]');
    try {
      const riceList = await this.prisma.riceManage.findMany({
        orderBy: { riceNameEng: 'asc' },
      });
      // console.log('[AdminService.getAllRice] count:', riceList.length);
      return response.status(200).send(riceList);
    } catch (error) {
      console.error('[AdminService.getAllRice]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async getRiceById(id: string, request: any, response: any): Promise<void> {
    // console.log('[AdminService.getRiceById] id:', id);
    try {
      const rice = await this.prisma.riceManage.findUnique({
        where: { riceManageID: id },
      });
      if (!rice) {
        // console.log('[AdminService.getRiceById] not found:', id);
        return response.status(404).send({ message: 'Rice not found' });
      }
      // console.log('[AdminService.getRiceById] found:', rice.riceManageID);
      return response.status(200).send(rice);
    } catch (error) {
      console.error('[AdminService.getRiceById]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async updateRice(
    id: string,
    dto: UpdateRiceManageDto,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[AdminService.updateRice] id:', id);
    try {
      const existingRice = await this.prisma.riceManage.findUnique({
        where: { riceManageID: id },
      });
      if (!existingRice) {
        // console.log('[AdminService.updateRice] not found:', id);
        return response.status(404).send({ message: 'Rice not found' });
      }
      const updatedRice = await this.prisma.riceManage.update({
        where: { riceManageID: id },
        data: dto,
      });
      // console.log('[AdminService.updateRice] updated:', updatedRice.riceManageID);
      return response.status(200).send(updatedRice);
    } catch (error) {
      console.error('[AdminService.updateRice]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async deleterice(id: string, request: any, response: any): Promise<void> {
    // console.log('[AdminService.deleterice] id:', id);
    try {
      const existingRice = await this.prisma.riceManage.findUnique({
        where: { riceManageID: id },
      });
      if (!existingRice) {
        // console.log('[AdminService.deleterice] not found:', id);
        return response.status(404).send({ message: 'Rice not found' });
      }
      await this.prisma.riceManage.delete({ where: { riceManageID: id } });
      // console.log('[AdminService.deleterice] deleted:', id);
      return response.status(200).send({ message: 'Rice deleted successfully' });
    } catch (error) {
      console.error('[AdminService.deleterice]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async searchrice(
    riceNameEng?: string,
    riceNameThai?: string,
    riceType?: string,
    request?: any,
    response?: any,
  ): Promise<void> {
    // console.log('[AdminService.searchrice] riceNameEng:', riceNameEng, 'riceNameThai:', riceNameThai, 'riceType:', riceType);
    try {
      const filters: any[] = [];

      if (riceNameEng) {
        filters.push({ riceNameEng: { contains: riceNameEng, mode: 'insensitive' } });
      }
      if (riceNameThai) {
        filters.push({ riceNameThai: { contains: riceNameThai, mode: 'insensitive' } });
      }
      if (riceType) {
        filters.push({ riceType: { contains: riceType, mode: 'insensitive' } });
      }

      const where = filters.length > 0 ? { OR: filters } : {};

      const riceList = await this.prisma.riceManage.findMany({
        where,
        orderBy: { riceNameEng: 'asc' },
      });

      // console.log('[AdminService.searchrice] count:', riceList.length);
      return response.status(200).send(riceList);
    } catch (error) {
      console.error('[AdminService.searchrice]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async createManyRice(
    dto: CreateRiceManageDto[],
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[AdminService.createManyRice] count:', dto.length);
    try {
      const newRiceList = await this.prisma.riceManage.createMany({
        data: dto,
        skipDuplicates: true,
      });
      // console.log('[AdminService.createManyRice] created:', newRiceList.count);
      return response.status(201).send({ result: 'Created rice data complete', data: newRiceList });
    } catch (error) {
      console.error('[AdminService.createManyRice]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  // ─── Staff ──────────────────────────────────────────────────────────────────

  async createStaff(
    dto: CreateStaffDto,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[AdminService.createStaff] email:', dto.email);
    try {
      const last = await this.prisma.staff.findFirst({
        orderBy: { staffNo: 'desc' },
      });
      const nextStaffNo = (last?.staffNo ?? 0) + 1;

      const newStaff = await this.prisma.staff.create({
        data: {
          staffNo: nextStaffNo,
          staffName: dto.staffName,
          email: dto.email,
          phone: dto.phone,
          position: dto.position,
        },
      });
      // console.log('[AdminService.createStaff] created staffID:', newStaff.staffID);
      return response.status(201).send(newStaff);
    } catch (error) {
      console.error('[AdminService.createStaff]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async getAllStaff(request: any, response: any): Promise<void> {
    // console.log('[AdminService.getAllStaff]');
    try {
      const staffList = await this.prisma.staff.findMany({
        orderBy: { staffNo: 'asc' },
        select: {
          staffID: true,
          staffNo: true,
          staffName: true,
          email: true,
          phone: true,
          position: true,
        },
      });
      // console.log('[AdminService.getAllStaff] count:', staffList.length);
      return response.status(200).send(staffList);
    } catch (error) {
      console.error('[AdminService.getAllStaff]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async getStaffById(id: string, request: any, response: any): Promise<void> {
    // console.log('[AdminService.getStaffById] id:', id);
    try {
      const staff = await this.prisma.staff.findUnique({
        where: { staffID: id },
        select: {
          staffID: true,
          staffNo: true,
          staffName: true,
          email: true,
          phone: true,
          position: true,
        },
      });
      if (!staff) {
        // console.log('[AdminService.getStaffById] not found:', id);
        return response.status(404).send({ message: 'Staff not found' });
      }
      // console.log('[AdminService.getStaffById] found:', staff.staffID);
      return response.status(200).send(staff);
    } catch (error) {
      console.error('[AdminService.getStaffById]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async deleteStaff(id: string, request: any, response: any): Promise<void> {
    // console.log('[AdminService.deleteStaff] id:', id);
    try {
      const existingStaff = await this.prisma.staff.findUnique({
        where: { staffID: id },
      });
      if (!existingStaff) {
        // console.log('[AdminService.deleteStaff] not found:', id);
        return response.status(404).send({ message: 'Staff not found' });
      }
      await this.prisma.staff.delete({ where: { staffID: id } });
      // console.log('[AdminService.deleteStaff] deleted:', id);
      return response.status(200).send({ message: 'Staff deleted successfully' });
    } catch (error) {
      console.error('[AdminService.deleteStaff]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async searchStaff(
    staffNo?: number,
    staffName?: string,
    staffSurname?: string,
    request?: any,
    response?: any,
  ): Promise<void> {
    // console.log('[AdminService.searchStaff] staffNo:', staffNo, 'staffName:', staffName);
    try {
      const filters: any[] = [];

      if (staffNo) {
        filters.push({ staffNo: staffNo });
      }

      const fullSearch = [staffName, staffSurname]
        .filter((v) => v && v.trim() !== '')
        .join(' ')
        .trim();

      if (fullSearch) {
        const words = fullSearch.split(/\s+/);
        filters.push({
          OR: [
            { fullName: { contains: fullSearch, mode: 'insensitive' } },
            ...words.map((word) => ({
              fullName: { contains: word, mode: 'insensitive' },
            })),
          ],
        });
      }

      const where = filters.length > 0 ? { AND: filters } : {};

      const result = await this.prisma.riceManage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      // console.log('[AdminService.searchStaff] count:', result.length);
      return response.status(200).send({ message: 'Search staff success', data: result });
    } catch (error) {
      console.error('[AdminService.searchStaff]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async updateStaff(
    id: string,
    dto: UpdateStaffDto,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[AdminService.updateStaff] id:', id);
    try {
      const existingStaff = await this.prisma.staff.findUnique({
        where: { staffID: id },
      });
      if (!existingStaff) {
        // console.log('[AdminService.updateStaff] not found:', id);
        return response.status(404).send({ message: 'Staff not found' });
      }
      const updatedStaff = await this.prisma.staff.update({
        where: { staffID: id },
        data: dto,
      });
      // console.log('[AdminService.updateStaff] updated:', updatedStaff.staffID);
      return response.status(200).send(updatedStaff);
    } catch (error) {
      console.error('[AdminService.updateStaff]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  // ─── Packing ─────────────────────────────────────────────────────────────────

  async addmanypacking(
    dto: CreatePackingDto[],
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[AdminService.addmanypacking] count:', dto.length);
    try {
      const newPackingList = await this.prisma.packing.createMany({
        data: dto,
        skipDuplicates: true,
      });
      // console.log('[AdminService.addmanypacking] created:', newPackingList.count);
      return response.status(201).send({ message: 'Created packing data complete', data: newPackingList });
    } catch (error) {
      console.error('[AdminService.addmanypacking]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async addpacking(
    dto: CreatePackingDto,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[AdminService.addpacking] packingName:', dto.packingName);
    try {
      const newPacking = await this.prisma.packing.create({ data: dto });
      // console.log('[AdminService.addpacking] created packingID:', newPacking.packingID);
      return response.status(201).send({ message: 'Created packing data complete', data: newPacking });
    } catch (error) {
      console.error('[AdminService.addpacking]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async searchpacking(
    packingName?: string,
    unit?: string,
    request?: any,
    response?: any,
  ): Promise<void> {
    // console.log('[AdminService.searchpacking] packingName:', packingName, 'unit:', unit);
    try {
      const filters: any[] = [];

      if (packingName) {
        filters.push({ packingName: { contains: packingName, mode: 'insensitive' } });
      }
      if (unit) {
        filters.push({ unit: { contains: unit, mode: 'insensitive' } });
      }

      const where = filters.length > 0 ? { AND: filters } : {};

      const packingList = await this.prisma.packing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      // console.log('[AdminService.searchpacking] count:', packingList.length);
      return response.status(200).send({ message: 'Search packing success', data: packingList });
    } catch (error) {
      console.error('[AdminService.searchpacking]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async geteachpacking(id: string, request: any, response: any): Promise<void> {
    // console.log('[AdminService.geteachpacking] id:', id);
    try {
      const packing = await this.prisma.packing.findUnique({
        where: { packingID: id },
      });
      if (!packing) {
        // console.log('[AdminService.geteachpacking] not found:', id);
        return response.status(404).send({ message: 'Packing not found' });
      }
      // console.log('[AdminService.geteachpacking] found:', packing.packingID);
      return response.status(200).send({ message: 'Get packing data complete', data: packing });
    } catch (error) {
      console.error('[AdminService.geteachpacking]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async getallpackingdata(request: any, response: any): Promise<void> {
    // console.log('[AdminService.getallpackingdata]');
    try {
      const packingList = await this.prisma.packing.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          packingID: true,
          packingName: true,
          unit: true,
        },
      });
      // console.log('[AdminService.getallpackingdata] count:', packingList.length);
      return response.status(200).send({ message: 'Get all packing data complete', data: packingList });
    } catch (error) {
      console.error('[AdminService.getallpackingdata]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async updatepacking(
    id: string,
    dto: UpdatePackingDto,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[AdminService.updatepacking] id:', id);
    try {
      const existingPacking = await this.prisma.packing.findUnique({
        where: { packingID: id },
      });
      if (!existingPacking) {
        // console.log('[AdminService.updatepacking] not found:', id);
        return response.status(404).send({ message: 'Packing not found' });
      }
      const updatedPacking = await this.prisma.packing.update({
        where: { packingID: id },
        data: dto,
      });
      // console.log('[AdminService.updatepacking] updated:', updatedPacking.packingID);
      return response.status(200).send({ message: 'Updated packing data complete', data: updatedPacking });
    } catch (error) {
      console.error('[AdminService.updatepacking]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async getEachPacking(id: string, request: any, response: any): Promise<void> {
    // console.log('[AdminService.getEachPacking] id:', id);
    try {
      const packing = await this.prisma.packing.findUnique({
        where: { packingID: id },
      });
      if (!packing) {
        // console.log('[AdminService.getEachPacking] not found:', id);
        return response.status(404).send({ message: 'Packing not found' });
      }
      // console.log('[AdminService.getEachPacking] found:', packing.packingID);
      return response.status(200).send({ message: 'Get packing data complete', data: packing });
    } catch (error) {
      console.error('[AdminService.getEachPacking]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async deletePacking(id: string, request: any, response: any): Promise<void> {
    // console.log('[AdminService.deletePacking] id:', id);
    try {
      const existingPacking = await this.prisma.packing.findUnique({
        where: { packingID: id },
      });
      if (!existingPacking) {
        // console.log('[AdminService.deletePacking] not found:', id);
        return response.status(404).send({ message: 'Packing not found' });
      }
      await this.prisma.packing.delete({ where: { packingID: id } });
      // console.log('[AdminService.deletePacking] deleted:', id);
      return response.status(200).send({ message: 'Packing deleted successfully' });
    } catch (error) {
      console.error('[AdminService.deletePacking]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  // ─── Company ─────────────────────────────────────────────────────────────────

  async getcompany(request: any, response: any): Promise<void> {
    // console.log('[AdminService.getcompany]');
    try {
      const companyData = await this.prisma.company.findFirst();
      // console.log('[AdminService.getcompany] found:', companyData?.companyID ?? 'none');
      return response.status(200).send({ message: 'Get company data complete', data: companyData });
    } catch (error) {
      console.error('[AdminService.getcompany]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async getCompany(request: any, response: any): Promise<void> {
    // console.log('[AdminService.getCompany]');
    try {
      const companyData = await this.prisma.company.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          companyID: true,
          companyNameEN: true,
          companyNameTH: true,
          companyDescription: true,
        },
      });
      // console.log('[AdminService.getCompany] count:', companyData.length);
      return response.status(200).send({ message: 'Get company data complete', data: companyData });
    } catch (error) {
      console.error('[AdminService.getCompany]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async postCompany(
    dto: CreateCompanyDto,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[AdminService.postCompany] companyNameTH:', dto.companyNameTH);
    try {
      const newCompany = await this.prisma.company.create({ data: dto });
      // console.log('[AdminService.postCompany] created companyID:', newCompany.companyID);
      return response.status(201).send({ message: 'Created company data complete', data: newCompany });
    } catch (error) {
      console.error('[AdminService.postCompany]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async deleteCompany(id: string, request: any, response: any): Promise<void> {
    // console.log('[AdminService.deleteCompany] id:', id);
    try {
      const existingCompany = await this.prisma.company.findUnique({
        where: { companyID: id },
      });
      if (!existingCompany) {
        // console.log('[AdminService.deleteCompany] not found:', id);
        return response.status(404).send({ message: 'Company not found' });
      }
      await this.prisma.company.delete({ where: { companyID: id } });
      // console.log('[AdminService.deleteCompany] deleted:', id);
      return response.status(200).send({ message: 'Company deleted successfully' });
    } catch (error) {
      console.error('[AdminService.deleteCompany]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async updateCompany(
    id: string,
    dto: UpdateCompanyDto,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[AdminService.updateCompany] id:', id);
    try {
      const existingCompany = await this.prisma.company.findUnique({
        where: { companyID: id },
      });
      if (!existingCompany) {
        // console.log('[AdminService.updateCompany] not found:', id);
        return response.status(404).send({ message: 'Company not found' });
      }
      const updatedCompany = await this.prisma.company.update({
        where: { companyID: id },
        data: dto,
      });
      // console.log('[AdminService.updateCompany] updated:', updatedCompany.companyID);
      return response.status(200).send({ message: 'Updated company data complete', data: updatedCompany });
    } catch (error) {
      console.error('[AdminService.updateCompany]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async searchCompany(
    companyName: string,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[AdminService.searchCompany] companyName:', companyName);
    try {
      const where = companyName
        ? {
            OR: [
              { companyNameEN: { contains: companyName, mode: 'insensitive' as const } },
              { companyNameTH: { contains: companyName } },
            ],
          }
        : {};

      const companyList = await this.prisma.company.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      // console.log('[AdminService.searchCompany] count:', companyList.length);
      return response.status(200).send({ message: 'Search company success', data: companyList });
    } catch (error) {
      console.error('[AdminService.searchCompany]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async getEachCompany(id: string, request: any, response: any): Promise<void> {
    // console.log('[AdminService.getEachCompany] id:', id);
    try {
      const company = await this.prisma.company.findUnique({
        where: { companyID: id },
      });
      if (!company) {
        // console.log('[AdminService.getEachCompany] not found:', id);
        return response.status(404).send({ message: 'Company not found' });
      }
      // console.log('[AdminService.getEachCompany] found:', company.companyID);
      return response.status(200).send({ message: 'Get company data complete', data: company });
    } catch (error) {
      console.error('[AdminService.getEachCompany]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  // ─── SurveyName ──────────────────────────────────────────────────────────────

  async getAllSurveyName(
    page: number,
    limit: number,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[AdminService.getAllSurveyName] page:', page, 'limit:', limit);
    try {
      const skip = (page - 1) * limit;

      const [surveyNameList, total] = await Promise.all([
        this.prisma.surveyName.findMany({
          skip,
          take: limit,
          orderBy: { changwat: 'asc' },
        }),
        this.prisma.surveyName.count(),
      ]);

      // console.log('[AdminService.getAllSurveyName] count:', surveyNameList.length, 'total:', total);
      return response.status(200).send({
        message: 'Get all survey name data complete',
        data: surveyNameList,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('[AdminService.getAllSurveyName]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async getEachSurveyName(
    id: string,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[AdminService.getEachSurveyName] id:', id);
    try {
      const surveyName = await this.prisma.surveyName.findUnique({
        where: { surveyNameID: id },
      });
      if (!surveyName) {
        // console.log('[AdminService.getEachSurveyName] not found:', id);
        return response.status(404).send({ message: 'Survey name not found' });
      }
      // console.log('[AdminService.getEachSurveyName] found:', surveyName.surveyNameID);
      return response.status(200).send({ message: 'Get survey name data complete', data: surveyName });
    } catch (error) {
      console.error('[AdminService.getEachSurveyName]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async addSurveyName(
    dto: CreateSurveyDto,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[AdminService.addSurveyName] dto:', dto);
    try {
      const newSurveyName = await this.prisma.surveyName.create({ data: dto });
      // console.log('[AdminService.addSurveyName] created:', newSurveyName.surveyNameID);
      return response.status(201).send({ message: 'Created survey name data complete', data: newSurveyName });
    } catch (error) {
      console.error('[AdminService.addSurveyName]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async deleteSurveyName(
    id: string,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[AdminService.deleteSurveyName] id:', id);
    try {
      const existingSurveyName = await this.prisma.surveyName.findUnique({
        where: { surveyNameID: id },
      });
      if (!existingSurveyName) {
        // console.log('[AdminService.deleteSurveyName] not found:', id);
        return response.status(404).send({ message: 'Survey name not found' });
      }
      await this.prisma.surveyName.delete({ where: { surveyNameID: id } });
      // console.log('[AdminService.deleteSurveyName] deleted:', id);
      return response.status(200).send({ message: 'Survey name deleted successfully' });
    } catch (error) {
      console.error('[AdminService.deleteSurveyName]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async updateSurveyName(
    id: string,
    dto: UpdateSurveyNameDto,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[AdminService.updateSurveyName] id:', id);
    try {
      const existingSurveyName = await this.prisma.surveyName.findUnique({
        where: { surveyNameID: id },
      });
      if (!existingSurveyName) {
        // console.log('[AdminService.updateSurveyName] not found:', id);
        return response.status(404).send({ message: 'Survey name not found' });
      }
      const updatedSurveyName = await this.prisma.surveyName.update({
        where: { surveyNameID: id },
        data: dto,
      });
      // console.log('[AdminService.updateSurveyName] updated:', updatedSurveyName.surveyNameID);
      return response.status(200).send({ message: 'Updated survey name data complete', data: updatedSurveyName });
    } catch (error) {
      console.error('[AdminService.updateSurveyName]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async searchSurveyName(
    changwat?: string,
    amphoe?: string,
    tambon?: string,
    request?: any,
    response?: any,
  ): Promise<void> {
    // console.log('[AdminService.searchSurveyName] changwat:', changwat, 'amphoe:', amphoe, 'tambon:', tambon);
    try {
      const filters: any[] = [];

      if (changwat) {
        filters.push({ changwat: { contains: changwat, mode: 'insensitive' } });
      }
      if (amphoe) {
        filters.push({ amphoe: { contains: amphoe, mode: 'insensitive' } });
      }
      if (tambon) {
        filters.push({ tambon: { contains: tambon, mode: 'insensitive' } });
      }

      const where = filters.length > 0 ? { AND: filters } : {};

      const surveyNameList = await this.prisma.surveyName.findMany({
        where,
        orderBy: { changwat: 'asc' },
        select: {
          surveyNameID: true,
          changwat: true,
          surveyNameEN: true,
          surveyNameTH: true,
        },
      });

      // console.log('[AdminService.searchSurveyName] count:', surveyNameList.length);
      return response.status(200).send({ message: 'Search survey name success', data: surveyNameList });
    } catch (error) {
      console.error('[AdminService.searchSurveyName]', error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }
}
