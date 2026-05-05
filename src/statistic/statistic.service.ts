import { Injectable, Req, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FastifyReply } from 'fastify';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class StatisticService {
  [x: string]: any;
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async getStatisticData(startdate: string, enddate: string, @Req() request: any,
      @Res({ passthrough: true }) response: FastifyReply) {
    try {
      const parsedStartDate = new Date(startdate);
      const parsedEndDate = new Date(enddate);
     const staticticData = await this.prisma.validate_Check_Weight.findMany({
  where: {
    time: {
      gte: parsedStartDate,
      lte: parsedEndDate,
    },
  },
  select: {
    riceName    : true,
    supplierName    : true,
   goDown       : true,
  weightPerTon  : true,
    checkWeightID: true,
    jobID       : true,
    loadingDetails  : true,
    time: true,
    request: {
      select: {
        requestID: true,
        // ใส่ field ที่อยากได้เพิ่ม
    licenseNumber: true,
        companyName: true,
        companyNameEng  : true,
      },
    },
    description:{
        select:{
            descriptionID:true,
            index:true,
            destination : true,
            vehicleName : true,
        }
    }
  },
  orderBy: {
  time: 'asc'
}

});

const licenseNumbers = [
  ...new Set(staticticData.map((item) => item.request.licenseNumber).filter(Boolean)),
];

const licenseDetails = await this.prisma.dataFromGoverment.findMany({
  where: {
    licenseNumber: {
      in: licenseNumbers,
    },
  },
  select: {
    licenseNumber: true,
    exporter: true,
    product: true,
    exchangeRate: true,
    
    
    licenseDetails: {
      select: {
       pricePerUnit: true,
      },
    },
  },
});


const licenseMap = new Map(
  licenseDetails.map((item) => [item.licenseNumber, item])
);

const excelLikeData = staticticData.map((cw, index) => 
    {
    const license = licenseMap.get(cw.request.licenseNumber);

    return {
      'ลำดับที่': index + 1,
//   checkWeightID: cw.checkWeightID,
    ปี: cw.time
  ? (cw.time.getFullYear() + 543).toString().slice(-2)
  : null,
  'ปริมาณต่อตัน'  : cw.weightPerTon,
  ชนิดข้าว: cw.riceName,
  เรือใหญ่: cw.description?.vehicleName,
//   requestID: cw.request?.requestID || null,
  'index': cw.description?.index || null,
  ผู้ได้รับอนุญาติส่งออก : cw.request?.companyName || null, 
  destination : cw.description?.destination || null,
  jobiD: cw.jobID,
  loadingDetails: cw.loadingDetails?.toLowerCase().includes('loading') ? '✓' : '',
    supplierName: cw.supplierName,
    ผู้ส่งมอบ: cw.goDown,
    ราคา: license?.licenseDetails?.[0]?.pricePerUnit || null, 
    อัตราแลกเปลี่ยน : license?.exchangeRate || null,
    เพิ่มเติม: cw.riceName,
}
    });


      return response.status(200).send(excelLikeData);
    } catch (error) {
      throw new Error('Error fetching statistic data');
    }
  }
}
