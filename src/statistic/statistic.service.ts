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
    certificate :{
      status: true,
    }
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
        licenseNumber: true,
        companyName: true,
        companyNameEng: true,
        surveyLocateNameThai: true,
      },
    },
    description:{
        select:{
            descriptionID:true,
            index:true,
            destination : true,
            vehicleName : true,
            licenseDetailID: true,
              netWeightTON : true,
        }
    },
    certificate: {
      select: {
        certNo: true,
      },
    },
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
    exchangeRate: true,
    licenseDetails: {
      select: {
        licenseDetailID: true,
        pricePerUnit: true,
      },
    },
  },
});


const licenseDetailMap = new Map<string, { pricePerUnit: number | null; exchangeRate: number }>();
licenseDetails.forEach((item) => {
  item.licenseDetails.forEach((detail) => {
    licenseDetailMap.set(detail.licenseDetailID, {
      pricePerUnit: detail.pricePerUnit,
      exchangeRate: item.exchangeRate,
    });
  });
});

const surveyNameTHList = [
  ...new Set(staticticData.map((item) => item.request?.surveyLocateNameThai).filter(Boolean)),
];

const surveyNames = await this.prisma.surveyName.findMany({
  where: { surveyNameTH: { in: surveyNameTHList as string[] } },
  select: { surveyNameTH: true, surveyNameEN: true },
});

const surveyNameMap = new Map(
  surveyNames.map((s) => [s.surveyNameTH, s.surveyNameEN])
);

const riceNameList = [
  ...new Set(staticticData.map((item) => item.riceName).filter(Boolean)),
];

const riceManageList = await this.prisma.riceManage.findMany({
  where: { riceNameThai: { in: riceNameList as string[] } },
  select: {
    riceNameThai: true,
    riceNameEng: true,
    riceCodeT: true,
    riceCode1: true,
    riceCode2: true,
    riceType: true,
  },
});

const riceManageMap = new Map(
  riceManageList.map((r) => [r.riceNameThai, r])
);

const excelLikeData = staticticData.map((cw, index) =>
    {
    const licenseDetail = cw.description?.licenseDetailID ? licenseDetailMap.get(cw.description.licenseDetailID) : null;
    const surveyNameTH = cw.request?.surveyLocateNameThai || null;
    const surveyNameEN = surveyNameTH ? surveyNameMap.get(surveyNameTH) : null;
    const riceInfo = cw.riceName ? riceManageMap.get(cw.riceName) : null;
      
    return {
      'ลำดับที่': index + 1,
//   checkWeightID: cw.checkWeightID,
ผู้ได้รับอนุญาติส่งออก : cw.request?.companyName || null,
 ผู้ส่งมอบ: surveyNameEN || surveyNameTH,
  เข้าตู้: cw.loadingDetails?.toLowerCase().includes('loading') ? '✓' : '',
    'รายการที่': cw.description?.index || null,
    ปี: cw.time
  ? (cw.time.getFullYear() + 543).toString().slice(-2)
  : null,
  'เลขใบอนุญาต': cw.request?.licenseNumber?.slice(-5) || null,
    'คำสั่งจ่างงานที่': cw.jobID,
      เรือใหญ่: cw.description?.vehicleName,
      เมืองตราส่ง : cw.description?.destination,
        
       'ชนิดข้าว EN': riceInfo?.riceNameEng || null,
         'ปริมาณต่อตัน'  : cw.description?.netWeightTON  || null,
        T: riceInfo?.riceCodeT || null,
        'CODE 1': riceInfo?.riceCode1 || null,
        '(Space1)':  null,
        'CODE 2': riceInfo?.riceCode2 || null,
          '(Space2)':  null,
           'ราคา': licenseDetail?.pricePerUnit ?? null,
               'อัตราแลกเปลี่ยน': licenseDetail?.exchangeRate ?? null,
        ชื่อข้าวไทย: cw.riceName,


//   certNo : cw.certificate?.certNo || null,
// //   requestID: cw.request?.requestID || null,
//   destination : cw.description?.destination || null,
//     supplierName: cw.supplierName,
//     ราคา: license?.licenseDetails?.[0]?.pricePerUnit || null,

//     เพิ่มเติม: cw.riceName,
}
    });


      return response.status(200).send(excelLikeData);
    } catch (error) {
      throw new Error('Error fetching statistic data');
    }
  }
}

