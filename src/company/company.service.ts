import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { rethrowAsHttpException } from 'src/common/service-error';
import { CreateCompanyDto } from 'src/dto/company.dto';

const EMPTY_FIELD_PLACEHOLDER = 'ไม่มี';

export interface CompanySummary {
  companyID: string;
  companyNameTH: string;
  companyNameEN: string;
  companyDescription: string;
}

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCompanies(): Promise<CompanySummary[]> {
    console.log('[CompanyService.getAllCompanies]');
    try {
      const companies = await this.prisma.company.findMany({
        select: {
          companyID: true,
          companyNameTH: true,
          companyDescription: true,
          companyNameEN: true,
        },
      });
      console.log('[CompanyService.getAllCompanies] result count:', companies.length);
      return companies;
    } catch (error) {
      rethrowAsHttpException('CompanyService.getAllCompanies', error);
    }
  }

  async createManyCompanies(dtoList: CreateCompanyDto[]): Promise<{ message: string }> {
    console.log('[CompanyService.createManyCompanies] count:', dtoList?.length);
    try {
      if (!dtoList || dtoList.length === 0) {
        throw new BadRequestException('No data provided');
      }

      const { count } = await this.prisma.company.createMany({
        data: dtoList.map((dto) => ({
          companyNameTH: dto.companyNameTH || EMPTY_FIELD_PLACEHOLDER,
          companyNameEN: dto.companyNameEN || EMPTY_FIELD_PLACEHOLDER,
          companyDescription: dto.companyDescription || EMPTY_FIELD_PLACEHOLDER,
        })),
        skipDuplicates: true,
      });

      console.log('[CompanyService.createManyCompanies] result created:', count);
      return { message: `Created ${count} companies successfully` };
    } catch (error) {
      rethrowAsHttpException('CompanyService.createManyCompanies', error);
    }
  }
}
