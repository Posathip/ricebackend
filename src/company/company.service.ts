import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCompanyDto } from 'src/dto/company.dto';

@Injectable()
export class CompanyService {[x: string]: any;
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,

    
  ) {}
    
  async getCompanyData(request: any, response: any){
try {
    const getcompany = await this.prisma.company.findMany(
        {
            select: {
            companyID: true,
            companyNameTH: true,
            companyDescription: true,
              companyNameEN: true,
          
            },
        }
        );
    return response.status(200).send(getcompany);
} catch (error) {
    return response.status(500).send({ error: 'Failed to retrieve company data' });
}
  }
 async postData(dto: CreateCompanyDto[], request: any, response: any) {
    try {
        // ตรวจสอบว่ามีข้อมูลส่งมาไหม
        if (!dto || dto.length === 0) {
            return response.status(400).send({ message: 'No data provided' });
        }

        const postcompany = await this.prisma.company.createMany({
            data: dto.map((item) => ({
                companyNameTH: item.companyNameTH || 'ไม่มี', // จัดการค่าว่าง
                companyNameEN: item.companyNameEN || 'ไม่มี',
                companyDescription: item.companyDescription || 'ไม่มี',
            })),
            skipDuplicates: true, // เพิ่มตัวนี้ไว้เผื่อมีข้อมูลซ้ำ จะได้ไม่พัง (ถ้ามี Unique constraint)
        });

        return response.status(200).send({
            message: `Created ${postcompany.count} companies successfully`,
        });
    } catch (error) {
        console.error(error); // คอยดู log ฝั่ง server ว่าพังเพราะอะไร
        return response.status(500).send({ 
            error: 'Failed to create company data',
            details: error
        });
    }
}
}