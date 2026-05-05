import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateCertificateDto } from 'src/dto/certificatesheet.dto';

@Injectable()
export class CertificateService {[x: string]: any;
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,

    
  ) {}

  async getAllCertificatebyDate(date: string, request: any, response: any){
    try {
        const parsedDate = new Date(date);
        const getallcheckweightdata = await this.prisma.certificatesheet.findMany(
            {
                where: {
                   dateCheckWeight : {
          gte: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()),
          lt: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate() + 1),
        },
                },
                select: {
                    certificateSheetID: true,
                    certNo          : true,
                    paperNoCopy    : true,
                    paperNoOriginal: true,
                    specialJob       : true,    
                    index             : true,
                    companyName     : true,
                    surveyLocateNameThai : true,
                     destination : true,
                     riceType : true,
                    totalNettWeight : true,
                },
            }
        );

        const startOfDay = new Date(parsedDate);
startOfDay.setHours(0, 0, 0, 0);


const latestDateBefore = await this.prisma.certificatesheet.findFirst({
  where: {
    dateCertificate: {
      lt: startOfDay, // ก่อนวันนั้น
    },
  },
  orderBy: {
    dateCertificate: 'desc', // เอาวันล่าสุด
  },
  select: {
    dateCertificate: true,
  },
});
console.log('Latest date before:', latestDateBefore?.dateCertificate);
        const prevDate = new Date(latestDateBefore?.dateCertificate || startOfDay);
    // prevDate.setDate(prevDate.getDate() - 1);
    

    // ช่วงเวลา "วันก่อนหน้า"
    const startPrev = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());
    const endPrev = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() + 1);

    // ✅ Query: หา certNo ล่าสุดของ "วันก่อนหน้า"
    const latestPrevCert = await this.prisma.certificatesheet.findFirst({
      where: {
        dateCertificate: {
          gte: startPrev,
          lt: endPrev,
        },
      },
      orderBy: {
        dateCertificate: 'desc',
      },
      select: {
        certNo: true,
        dateCheckWeight: true,
        paperNoOriginal: true,
        paperNoCopy: true,
      },
    });


       return response.status(200).send({
      data: getallcheckweightdata,
      previousDayLatestCertNo: latestPrevCert?.certNo || '000000',
      previousDayDate: latestPrevCert?.dateCheckWeight || null,
      previousDayPaperNoOriginal: latestPrevCert?.paperNoOriginal || null,
       });
    } catch (error) {
        return response.status(500).send({ error: 'Failed to retrieve check weight data' });
    }
  } 

async updateCertificate(certificateId: string, updateData: UpdateCertificateDto, request: any, response: any) {
    try {
        const updated = await this.prisma.certificatesheet.update({
            where: {
                certificateSheetID: certificateId,
            },
            data: updateData,
        });
        return response.status(200).send(updated);
    } catch (error) {
        return response.status(500).send({ error: 'Failed to update certificate' });
    }
}

async getcertificatebyid(certificateId: string, request: any, response: any) {
    try {
  
        const certificate = await this.prisma.certificatesheet.findUnique({
            where: {
                certificateSheetID: certificateId,
            },
        });
        if (!certificate) {
            return response.status(404).send({ error: 'Certificate not found' });
        }
        return response.status(200).send(certificate);
    } catch (error) {
        return response.status(500).send({ error: 'Failed to retrieve certificate' });
    }       

}
async searchCertificates(
  filters: { certNo?: string; jobID?: string; licenseNumber?: string },
  request: any,
  response: any
) {
  try {
  const where = {
  ...(filters.certNo && {
    certNo: {
      contains: filters.certNo,
      mode: 'insensitive' as const,
    },
  }),

  ...(filters.jobID && !isNaN(Number(filters.jobID)) && {
    jobID: Number(filters.jobID),
  }),

  ...(filters.licenseNumber && {
    licenseNumber: {
      contains: filters.licenseNumber,
      mode: 'insensitive' as const,
    },
  }),
};

    console.log(where);

    const results = await this.prisma.certificatesheet.findMany({
      where,
      select: {
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
      },
    });

    if (!results.length) {
      return response.status(404).send({ message: 'No data found' });
    }

    return response.status(200).send(results);
  } catch (error) {
    console.error(error);
    return response.status(500).send({
      message: 'Failed to search certificates',
    });
  }
}
}