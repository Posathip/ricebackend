import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { previousDay } from 'date-fns';
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
                    status : true,
                },
                orderBy:{
                  dateCheckWeight: 'asc',
                }
            }
        );

        const startOfDay = new Date(parsedDate);
startOfDay.setHours(0, 0, 0, 0);


const latestDateBefore = await this.prisma.certificatesheet.findFirst({
  where: {
    dateCheckWeight: {
      lt: startOfDay, // ก่อนวันนั้น
    },
  },
  orderBy: {
    dateCheckWeight: 'desc', // เอาวันล่าสุด
  },
  select: {
    dateCheckWeight: true,
  },
});
console.log('Latest date before:', latestDateBefore?.dateCheckWeight);
        const prevDate = new Date(latestDateBefore?.dateCheckWeight || startOfDay);
    // prevDate.setDate(prevDate.getDate() - 1);
    

    // ช่วงเวลา "วันก่อนหน้า"
    const startPrev = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());
    const endPrev = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() + 1);

   
    const latestPrevCert = await this.prisma.certificatesheet.findFirst({
      where: {
        dateCheckWeight: {
          gte: startPrev,
          lt: endPrev,
        },
      },
      orderBy: {
        dateCheckWeight: 'desc',
      },
      select: {
        certNo: true,
        dateCheckWeight: true,
        paperNoOriginal: true,
        paperNoCopy: true,
      },
    });

    const findlatestCertNo = await this.prisma.certificatesheet.findFirst({
      orderBy:{
        certNo: 'desc',
      },
      where: {
        certNo: {
          not: null,
        },  
      },
      select: {
        certNo: true,
        paperNoOriginal: true,
        paperNoCopy: true,
      },
    });
    const findlatestCertOriginal = await this.prisma.certificatesheet.findFirst({
      orderBy:{
        paperNoOriginal: 'desc',
      },
      where: {
        paperNoOriginal: {
          not: null,
        },  
      },
      select: {
        paperNoOriginal: true,
        paperNoCopy: true,
      },
    });
    // console.log('Latest certNo:', findlatestCertNo?.certNo);


       return response.status(200).send({
      data: getallcheckweightdata,
      previousDayLatestCertNo: findlatestCertNo?.certNo || 0,
      previousDayDate: latestPrevCert?.dateCheckWeight || null,
      previousDayPaperNoOriginal: findlatestCertOriginal?.paperNoOriginal || 0,
      previousDayPaperNoCopy: findlatestCertOriginal?.paperNoCopy || 0,
       });
    } catch (error) {
        return response.status(500).send({ error: 'Failed to retrieve check weight data' });
    }
  } 

async updateCertificate(certificateId: string, updateData: UpdateCertificateDto, request: any, response: any) {
    try {
 // check certNo
    if (updateData.certNo !== undefined) {
      const existingCertNo = await this.prisma.certificatesheet.findFirst({
        where: {
          certNo: updateData.certNo,
          NOT: {
            certificateSheetID: certificateId,
          },
        },
      });

      if (existingCertNo) {
        return response.status(400).send({
          error: 'certNo already exists',
        });
      }
    }

    // check paperNoOriginal
    if (updateData.paperNoOriginal !== undefined) {
      const existingPaperOriginal =
        await this.prisma.certificatesheet.findFirst({
          where: {
            paperNoOriginal: updateData.paperNoOriginal,
            NOT: {
              certificateSheetID: certificateId,
            },
          },
        });

      if (existingPaperOriginal) {
        return response.status(400).send({
          error: 'paperNoOriginal already exists',
        });
      }
    }

    // check paperNoCopy
    if (updateData.paperNoCopy !== undefined) {
      const existingPaperCopy =
        await this.prisma.certificatesheet.findFirst({
          where: {
            paperNoCopy: updateData.paperNoCopy,
            NOT: {
              certificateSheetID: certificateId,
            },
          },
        });

      if (existingPaperCopy) {
        return response.status(400).send({
          error: 'paperNoCopy already exists',
        });
      }
    }
        const updated = await this.prisma.certificatesheet.update({
            where: {
                certificateSheetID: certificateId,
            },
            data: updateData,
        });
        return response.status(200).send(updated);
    } catch (error) {
        return response.status(500).send({ error: 'Failed to update certificate' ,message : error });
    }
}

async getcertificatebyid(certificateId: string, request: any, response: any) {
    try {
  
       const certificate = await this.prisma.certificatesheet.findUnique({
  where: {
    certificateSheetID: certificateId,
  },
  select: {
    certificateSheetID: true,
    certNo: true,
    paperNoOriginal: true,
    paperNoCopy: true,
    licenseNumber: true,
    jobID: true,
    index: true,
    specialJob: true,
    No: true,
    title: true,
    companyName: true,
    surveyLocateNameThai: true,
    portName: true,
    destination: true,
    netWeightTON: true,
    riceType: true,
    note: true,
    dateCertificate: true,
    quantity: true,
    unit: true,
    descriptionOfGoodsLine1: true,
    descriptionOfGoodsLine2: true,
    descriptionOfGoodsLine3: true,
    packing: true,
    unitKGS_Nett: true,
    marks: true,
    shipper: true,
    goDown: true,
    dateOfLoading: true,
    dateCheckWeight: true,
    shippingPort: true,
    carryingVessel: true,
    qualityLine1: true,
    qualityLine2: true,
    weight: true,
    totalGrossWeight: true,
    totalTareWeight: true,
    totalNettWeight: true,
    status: true,

    checkWeight: {
      select: {
       
        
        supplierName: true,
        time: true,
        vesselName: true,
        noOfBags: true,
        grossWeight: true,
        netWeightW: true,
        netWeightTon: true,
       
        remainWeight: true,
        weightPerTon: true,
        goDown: true,
        loadingDetails: true,
        specialJob: true,
        vehicleName: true,
        riceName: true,
        quantity: true,
      }
    }
  }
});
const findEnNameSurvey = await this.prisma.surveyName.findFirst({
  where: {
    surveyNameTH: certificate?.surveyLocateNameThai || '',
  },
  select: {
    surveyNameEN: true,
  }
});
const findRiceNameEN = await this.prisma.riceManage.findFirst({
  where: {
    riceNameThai: certificate?.riceType || '',
  },
  select: {
    riceNameEng: true,
  }
});
const findCompanyNameEN = await this.prisma.company.findFirst({
  where: {
    companyNameTH: certificate?.companyName || '',
  },
  select: {
    companyNameEN: true,
  }
});
const certificateWithEnNames = {
  ...certificate,
  surveyLocateNameEN: findEnNameSurvey?.surveyNameEN || null,
  riceTypeEN: findRiceNameEN?.riceNameEng || null,
  companyNameEN: findCompanyNameEN?.companyNameEN || null,
};
        if (!certificate) {
            return response.status(404).send({ error: 'Certificate not found' });
        }
        return response.status(200).send(certificateWithEnNames);
    } catch (error) {
        return response.status(500).send({ error: 'Failed to retrieve certificate' });
    }       

}

async searchCertificates(
  filters: { certNo?: number; jobID?: string; licenseNumber?: string },
  request: any,
  response: any
) {
  try {
  const where = {
 ...(filters.certNo && {
  certNo: filters.certNo,
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

async filterAllCertificatebyDate(
  startdate: string,
  enddate: string,
  request: any,
  response: any
) {
  try {
    const start = new Date(startdate);
    const end = new Date(enddate);

    end.setHours(23, 59, 59, 999);

    const certificates = await this.prisma.certificatesheet.findMany({
      where: {
        dateCheckWeight: {
          gte: start,
          lte: end,
        },
        certNo: {
      not: null,
    },
      },
      select: {
        certNo: true,
        paperNoCopy: true,
        paperNoOriginal: true,
        companyName: true,
        destination: true,
        riceType: true,
        quantity: true,
        dateCertificate: true,
        goDown: true,
        licenseNumber: true,
        jobID: true,
        shippingPort: true,
      },
       orderBy: {
        certNo: 'asc',
      },
    });

     if (!certificates || certificates.length === 0) {
      return response.status(404).send({
        message: 'Data Not found',
      });
    }
    const result = await Promise.all(
      certificates.map(async (item) => {
        const company = await this.prisma.company.findFirst({
          where: {
            companyNameTH: item.companyName || '',
          },
          select: {
            companyNameEN: true,
          },
        });

        const rice = await this.prisma.riceManage.findFirst({
          where: {
            riceNameThai: item.riceType || '',
          },
          select: {
            riceNameEng: true,
          },
        });

        return {
          // 1
         วันที่: item.dateCertificate
  ? new Intl.DateTimeFormat('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(item.dateCertificate))
  : '',

          // 2
          ผู้ได้รับอนุญาต:
            company?.companyNameEN || item.companyName || '',

          // 3
          ผู้ส่งมอบ: item.goDown || '',

          // 4
          เลขที่ใบอนุญาต: item.licenseNumber?.slice(6) || '',

          // 5
          คำสั่งจ่ายงานเลขที่: item.jobID || '',

          // 6
          เรือใหญ่: item.shippingPort || '',

          // 7
          เมืองตราส่ง: item.destination || '',

          // 8
          ชนิดข้าว: rice?.riceNameEng || item.riceType || '',

          // 9
          'ปริมาณ/เมตริกตัน': Number(item.quantity || 0).toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}),

          // 10
          'CER NO.': item.certNo || '',

          // 11
          'PAPER NO': item.paperNoCopy || '',

          // 12
          'PAPER NO ': item.paperNoOriginal || '',
        };
      })
    );
    const summarize = certificates.reduce(
  (sum, item) => sum + Number(item.quantity || 0),
  0
);

    return response.status(200).send({ result,  'รวมปริมาณตัน': Number(summarize).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }), });
  } catch (error) {
    console.error(error);

    return response.status(500).send({
      message: 'Failed to filter certificates by date',
    });
  }
}

async filterAllCertificatebyMonth(
  startdate: string,
  enddate: string,
  request: any,
  response: any
) {
  try {
    const start = new Date(startdate);
    const end = new Date(enddate);
    // console.log('Start date:', start);
    // console.log('End date:', end);
    end.setHours(23, 59, 59, 999);

    const certificates = await this.prisma.certificatesheet.findMany({
      where: {
        dateCheckWeight: {
          gte: start,
          lte: end,
        },
         certNo: {
      not: null,
    },
      },

      select: {
        certNo: true,
        paperNoCopy: true,
        paperNoOriginal: true,
        companyName: true,
        destination: true,
        riceType: true,
        quantity: true,
        dateCertificate: true,
        goDown: true,
        licenseNumber: true,
        jobID: true,
        shippingPort: true,
      },
      orderBy: {
        certNo: 'asc',
      },
    });

     if (!certificates || certificates.length === 0) {
      return response.status(404).send({
        message: 'Data Notfound',
      });
    }

    const result = await Promise.all(
      certificates.map(async (item) => {
        const company = await this.prisma.company.findFirst({
          where: {
            companyNameTH: item.companyName || '',
          },

          select: {
            companyNameEN: true,
          },
        });

        const rice = await this.prisma.riceManage.findFirst({
          where: {
            riceNameThai: item.riceType || '',
          },

          select: {
            riceNameEng: true,
          },
        });

        return {
          วันที่: item.dateCertificate
            ? new Intl.DateTimeFormat('th-TH', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).format(new Date(item.dateCertificate))
            : '',

          ผู้ได้รับอนุญาต:
            company?.companyNameEN || item.companyName || '',

          ผู้ส่งมอบ: item.goDown || '',

          เลขที่ใบอนุญาต: item.licenseNumber?.slice(6) || '',

          คำสั่งจ่ายงานเลขที่: item.jobID || '',

          เรือใหญ่: item.shippingPort || '',

          เมืองตราส่ง: item.destination || '',

          ชนิดข้าว: rice?.riceNameEng || item.riceType || '',

        'ปริมาณ/เมตริกตัน': Number(item.quantity || 0).toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}),

          'CER NO.': item.certNo || '',

          'PAPER NO': item.paperNoCopy || '',

          'PAPER NO ': item.paperNoOriginal || '',
        };
      })
    );
     const summarize = certificates.reduce(
  (sum, item) => sum + Number(item.quantity || 0),
  0
);
   return response.status(200).send({ result,  'รวมปริมาณตัน': Number(summarize).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }), });

  } catch (error) {
    console.error(error);

    return response.status(500).send({
      message: 'Failed to filter certificates by month',
    });
  }
}

async gethistoryCertificate(
  licenseNumber: string,
  request: any,
  response: any
) {
 try {
  const certificatedetail = await this.prisma.dataFromGoverment.findMany({
  where: {
  licenseNumber: licenseNumber,
},
select: {
  exporter  : true,
  destinationCountry: true,
}});

const certificateHistory = await this.prisma.certificatesheet.findMany({
  where: {
    licenseNumber: licenseNumber,
 
  
      status: true,
  },

  select: {
    
  

    checkWeight: {
      select: {
        jobID: true,
        specialJob: true,
        goDown: true,
        grossWeight: true,
        netWeightTon: true,
        quantity: true,
        // noOfBags: true,
        // netWeightW: true,
        loadingDetails: true,
        riceName: true,
        vehicleName: true,
        request: {
          select: {
            shippingDateTime: true,
            // requestID: true,
            // companyName: true,
            // licenseNumber: true,
            // requestDate: true,
          },
        },

        // description: {
        //   select: {
        //     descriptionID: true,

        //   },
        // },
      },
    },
  },
});
const goDownList = [
  ...new Set(
    certificateHistory
      .map((item) => item.checkWeight?.goDown)
      .filter((value): value is string => Boolean(value))
  ),
];
const surveyNames = await this.prisma.surveyName.findMany({
  where: {
    surveyNameTH: {
      in: goDownList,
    },
  },

  select: {
    surveyNameTH: true,
    surveyNameEN: true,
    changwat    : true,
  },
});

const surveyMap = new Map(
  surveyNames.map((item) => [
    item.surveyNameTH,
    {
      surveyNameEN: item.surveyNameEN,
      changwat: item.changwat,
    },
  ])
);
const result = certificateHistory.map((item, index) => {
  const surveyData = surveyMap.get(
    item.checkWeight?.goDown || ""
  );

  return {
    index: (index + 1).toString(),
    ...item,

    checkWeight: {
      ...item.checkWeight,

      surveyName:
        surveyData?.surveyNameEN ||
        item.checkWeight?.goDown ||
        null,

      changwat: surveyData?.changwat || null,
    },
  };
});
return response.status(200).send({
  certificatedetail,
  result,
});
 }
 catch (error) {
  console.error(error);
  return response.status(500).send({
    message: 'Failed to retrieve certificate history',
  });
 }
}

}