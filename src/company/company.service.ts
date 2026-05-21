import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCompanyDto } from 'src/dto/company.dto';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async getCompanyData(request: any, response: any): Promise<void> {
    // console.log('[CompanyService.getCompanyData]');
    try {
      const companies = await this.prisma.company.findMany({
        select: {
          companyID: true,
          companyNameTH: true,
          companyDescription: true,
          companyNameEN: true,
        },
      });
      // console.log('[CompanyService.getCompanyData] count:', companies.length);
      return response.status(200).send(companies);
    } catch (error) {
      console.error('[CompanyService.getCompanyData]', error);
      return response.status(500).send({ error: 'Failed to retrieve company data' });
    }
  }

  async postData(
    dto: CreateCompanyDto[],
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[CompanyService.postData] count:', dto?.length);
    try {
      if (!dto || dto.length === 0) {
        throw new BadRequestException('No data provided');
      }

      const postcompany = await this.prisma.company.createMany({
        data: dto.map((item) => ({
          companyNameTH: item.companyNameTH || 'ไม่มี',
          companyNameEN: item.companyNameEN || 'ไม่มี',
          companyDescription: item.companyDescription || 'ไม่มี',
        })),
        skipDuplicates: true,
      });

      // console.log('[CompanyService.postData] created count:', postcompany.count);
      return response.status(200).send({
        message: `Created ${postcompany.count} companies successfully`,
      });
    } catch (error) {
      console.error('[CompanyService.postData]', error);
      if (error instanceof BadRequestException) throw error;
      return response.status(500).send({
        error: 'Failed to create company data',
        details: error,
      });
    }
  }
}
