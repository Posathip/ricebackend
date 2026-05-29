import { Injectable, Req, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FastifyReply } from 'fastify';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateCertificateDto } from 'src/dto/certificatesheet.dto';

@Injectable()
export class CertificateService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async getAllCertificatebyDate(
    date: string,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[CertificateService.getAllCertificatebyDate] date:', date);
    try {
      const parsedDate = new Date(date);
      const startOfDay = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate(),
      );
      const endOfDay = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate() + 1,
      );

      const getallcheckweightdata = await this.prisma.certificatesheet.findMany({
        where: {
          dateCheckWeight: { gte: startOfDay, lt: endOfDay },
        },
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
          status: true,
        },
        orderBy: { dateCheckWeight: 'asc' },
      });

      const latestDateBefore = await this.prisma.certificatesheet.findFirst({
        where: { dateCheckWeight: { lt: startOfDay } },
        orderBy: { dateCheckWeight: 'desc' },
        select: { dateCheckWeight: true },
      });

      // console.log('[CertificateService.getAllCertificatebyDate] latestDateBefore:', latestDateBefore?.dateCheckWeight);

      const prevDate = new Date(latestDateBefore?.dateCheckWeight || startOfDay);
      const startPrev = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());
      const endPrev = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() + 1);

      const latestPrevCert = await this.prisma.certificatesheet.findFirst({
        where: { dateCheckWeight: { gte: startPrev, lt: endPrev } },
        orderBy: { dateCheckWeight: 'desc' },
        select: { certNo: true, dateCheckWeight: true, paperNoOriginal: true, paperNoCopy: true },
      });

      const findlatestCertNo = await this.prisma.certificatesheet.findFirst({
        orderBy: { certNo: 'desc' },
        where: { certNo: { not: null } },
        select: { certNo: true, paperNoOriginal: true, paperNoCopy: true },
      });

      const findlatestCertOriginal = await this.prisma.certificatesheet.findFirst({
        orderBy: { paperNoOriginal: 'desc' },
        where: { paperNoOriginal: { not: null } },
        select: { paperNoOriginal: true, paperNoCopy: true },
      });

      // console.log('[CertificateService.getAllCertificatebyDate] returned', getallcheckweightdata.length, 'records');
      return response.status(200).send({
        data: getallcheckweightdata,
        previousDayLatestCertNo: findlatestCertNo?.certNo || 0,
        previousDayDate: latestPrevCert?.dateCheckWeight || null,
        previousDayPaperNoOriginal: findlatestCertOriginal?.paperNoOriginal || 0,
        previousDayPaperNoCopy: findlatestCertOriginal?.paperNoCopy || 0,
      });
    } catch (error) {
      console.error('[CertificateService.getAllCertificatebyDate]', error);
      return response.status(500).send({ error: 'Failed to retrieve check weight data' });
    }
  }

  async updateCertificate(
    certificateId: string,
    updateData: UpdateCertificateDto,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[CertificateService.updateCertificate] certificateId:', certificateId);
    try {
      await this.validateNoDuplicateCertNo(certificateId, updateData, response);
      await this.validateNoDuplicatePaperOriginal(certificateId, updateData, response);
      await this.validateNoDuplicatePaperCopy(certificateId, updateData, response);

      const updated = await this.prisma.certificatesheet.update({
        where: { certificateSheetID: certificateId },
        data: updateData,
      });

      // console.log('[CertificateService.updateCertificate] updated:', updated.certificateSheetID);
      return response.status(200).send(updated);
    } catch (error) {
      console.error('[CertificateService.updateCertificate]', error);
      return response.status(500).send({ error: 'Failed to update certificate', message: error });
    }
  }

  private async validateNoDuplicateCertNo(
    certificateId: string,
    updateData: UpdateCertificateDto,
    response: any,
  ): Promise<void> {
    if (updateData.certNo === undefined) return;

    const existing = await this.prisma.certificatesheet.findFirst({
      where: { certNo: updateData.certNo, NOT: { certificateSheetID: certificateId } },
    });

    if (existing) {
      return response.status(400).send({ error: 'certNo already exists' });
    }
  }

  private async validateNoDuplicatePaperOriginal(
    certificateId: string,
    updateData: UpdateCertificateDto,
    response: any,
  ): Promise<void> {
    if (updateData.paperNoOriginal === undefined) return;

    const existing = await this.prisma.certificatesheet.findFirst({
      where: { paperNoOriginal: updateData.paperNoOriginal, NOT: { certificateSheetID: certificateId } },
    });

    if (existing) {
      return response.status(400).send({ error: 'paperNoOriginal already exists' });
    }
  }

  private async validateNoDuplicatePaperCopy(
    certificateId: string,
    updateData: UpdateCertificateDto,
    response: any,
  ): Promise<void> {
    if (updateData.paperNoCopy === undefined) return;

    const existing = await this.prisma.certificatesheet.findFirst({
      where: { paperNoCopy: updateData.paperNoCopy, NOT: { certificateSheetID: certificateId } },
    });

    if (existing) {
      return response.status(400).send({ error: 'paperNoCopy already exists' });
    }
  }

  async getcertificatebyid(
    certificateId: string,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[CertificateService.getcertificatebyid] certificateId:', certificateId);
    try {
      const certificate = await this.prisma.certificatesheet.findUnique({
        where: { certificateSheetID: certificateId },
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
          packingLine1: true,
          packingLine2: true,
          packingLine3: true,
          applyGodown: true,

          checkWeight: {
            select: {
              supplierName: true,
              time: true,
              // vesselName: true,
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
            },
          },
        },
      });

      if (!certificate) {
        // console.log('[CertificateService.getcertificatebyid] not found:', certificateId);
        return response.status(404).send({ error: 'Certificate not found' });
      }

      const [findEnNameSurvey, findRiceNameEN, findCompanyNameEN] = await Promise.all([
        this.prisma.surveyName.findFirst({
          where: { surveyNameTH: certificate.surveyLocateNameThai || '' },
          select: { surveyNameEN: true },
        }),
        this.prisma.riceManage.findFirst({
          where: { riceNameThai: certificate.riceType || '' },
          select: { riceNameEng: true },
        }),
        this.prisma.company.findFirst({
          where: { companyNameTH: certificate.companyName || '' },
          select: { companyNameEN: true },
        }),
      ]);

      const certificateWithEnNames = {
        ...certificate,
        carryingVessel: this.toUpperStr(certificate.carryingVessel),
        descriptionOfGoodsLine1: this.toUpperStr(certificate.descriptionOfGoodsLine1),
        descriptionOfGoodsLine2: this.toUpperStr(certificate.descriptionOfGoodsLine2),
        descriptionOfGoodsLine3: this.toUpperStr(certificate.descriptionOfGoodsLine3),
        shipper: this.toTitleStr(certificate.shipper),
        surveyLocateNameEN: findEnNameSurvey?.surveyNameEN || null,
        riceTypeEN: findRiceNameEN?.riceNameEng || null,
        companyNameEN: findCompanyNameEN?.companyNameEN || null,
      };

      // console.log('[CertificateService.getcertificatebyid] found:', certificate.certificateSheetID);
      return response.status(200).send(certificateWithEnNames);
    } catch (error) {
      console.error('[CertificateService.getcertificatebyid]', error);
      return response.status(500).send({ error: 'Failed to retrieve certificate' });
    }
  }

  async searchCertificates(
    filters: { certNo?: number; jobID?: string; licenseNumber?: string },
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[CertificateService.searchCertificates] filters:', filters);
    try {
      const where = {
        ...(filters.certNo && { certNo: filters.certNo }),
        ...(filters.jobID && !isNaN(Number(filters.jobID)) && { jobID: Number(filters.jobID) }),
        ...(filters.licenseNumber && {
          licenseNumber: { contains: filters.licenseNumber, mode: 'insensitive' as const },
        }),
      };

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
        // console.log('[CertificateService.searchCertificates] no data found');
        return response.status(404).send({ message: 'No data found' });
      }

      // console.log('[CertificateService.searchCertificates] count:', results.length);
      return response.status(200).send(results);
    } catch (error) {
      console.error('[CertificateService.searchCertificates]', error);
      return response.status(500).send({ message: 'Failed to search certificates' });
    }
  }

  async filterAllCertificatebyDate(
    startdate: string,
    enddate: string,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[CertificateService.filterAllCertificatebyDate] startdate:', startdate, 'enddate:', enddate);
    try {
      const start = new Date(startdate);
      const end = new Date(enddate);
      end.setHours(23, 59, 59, 999);

      const certificates = await this.prisma.certificatesheet.findMany({
        where: {
          dateCheckWeight: { gte: start, lte: end },
          certNo: { not: null },
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
        orderBy: { certNo: 'asc' },
      });

      if (!certificates || certificates.length === 0) {
        // console.log('[CertificateService.filterAllCertificatebyDate] no data found');
        return response.status(404).send({ message: 'Data Not found' });
      }

      const result = await this.mapCertificatesToExportRows(certificates);
      const summarize = this.sumQuantity(certificates);

      // console.log('[CertificateService.filterAllCertificatebyDate] count:', result.length);
      return response.status(200).send({
        result,
        'รวมปริมาณตัน': Number(summarize).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      });
    } catch (error) {
      console.error('[CertificateService.filterAllCertificatebyDate]', error);
      return response.status(500).send({ message: 'Failed to filter certificates by date' });
    }
  }

  async filterAllCertificatebyMonth(
    startdate: string,
    enddate: string,
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[CertificateService.filterAllCertificatebyMonth] startdate:', startdate, 'enddate:', enddate);
    try {
      const start = new Date(startdate);
      const end = new Date(enddate);
      end.setHours(23, 59, 59, 999);

      const certificates = await this.prisma.certificatesheet.findMany({
        where: {
          dateCheckWeight: { gte: start, lte: end },
          certNo: { not: null },
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
        orderBy: { certNo: 'asc' },
      });

      if (!certificates || certificates.length === 0) {
        // console.log('[CertificateService.filterAllCertificatebyMonth] no data found');
        return response.status(404).send({ message: 'Data Notfound' });
      }

      const result = await this.mapCertificatesToExportRows(certificates);
      const summarize = this.sumQuantity(certificates);

      // console.log('[CertificateService.filterAllCertificatebyMonth] count:', result.length);
      return response.status(200).send({
        result,
        'รวมปริมาณตัน': Number(summarize).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      });
    } catch (error) {
      console.error('[CertificateService.filterAllCertificatebyMonth]', error);
      return response.status(500).send({ message: 'Failed to filter certificates by month' });
    }
  }

  private async mapCertificatesToExportRows(certificates: any[]): Promise<any[]> {
    return Promise.all(
      certificates.map(async (item) => {
        const company = await this.prisma.company.findFirst({
          where: { companyNameTH: item.companyName || '' },
          select: { companyNameEN: true },
        });

        const rice = await this.prisma.riceManage.findFirst({
          where: { riceNameThai: item.riceType || '' },
          select: { riceNameEng: true },
        });

        return {
          วันที่: item.dateCertificate
            ? new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
                new Date(item.dateCertificate),
              )
            : '',
          ผู้ได้รับอนุญาต: company?.companyNameEN || item.companyName || '',
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
          'CER NO.': this.formatCertNo(item.certNo),
          'PAPER NO': this.formatCertNo(item.paperNoCopy),
          'PAPER NO ': this.formatCertNo(item.paperNoOriginal),
        };
      }),
    );
  }

  private toUpperStr(val: string | null | undefined): string {
    return val ? val.toUpperCase() : '';
  }

  private toTitleStr(val: string | null | undefined): string {
    if (!val) return '';
    return val
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private formatCertNo(certNo: number | null | undefined): string {
    if (!certNo) return '';
    return certNo.toString().padStart(5, '0');
  }

  private sumQuantity(certificates: any[]): number {
    return certificates.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }


    async gethistoryCertificate(licenseNumber: string, @Req() request: any, @Res({ passthrough: true }) response: FastifyReply) {
      try {
        const data = await this.prisma.validate_Check_Weight.findMany({
          where: {
            status: true,
            description: { licenseNumber },
            certificate :{ status: true , },
          },
          select: {
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
            description: {
              select: { licenseDetailID: true,
                vehicleName: true
               },
            },
          },
          orderBy: { jobID: 'asc' },
        });
  
        // ดึง unique licenseDetailID และ bufferRemain ทีเดียว
        const uniqueLicenseDetailIDs = [...new Set(data.map((i) => i.description?.licenseDetailID).filter(Boolean))] as string[];
        const bufferRemains = await this.prisma.bufferRemain.findMany({
          where: { licenseDetailID: { in: uniqueLicenseDetailIDs } },
        });
        const bufferRemainMap = new Map(bufferRemains.map((b) => [b.licenseDetailID, b]));
  
        // ดึง surveyNameEN จาก surveyName table โดยใช้ surveyLocateNameThai
        const uniqueSurveyNames = [...new Set(data.map((i) => i.request?.surveyLocateNameThai).filter(Boolean))] as string[];
        const surveyNames = await this.prisma.surveyName.findMany({
          where: { surveyNameTH: { in: uniqueSurveyNames } },
          select: { surveyNameTH: true, surveyNameEN: true },
        });
        const surveyNameMap = new Map(surveyNames.map((s) => [s.surveyNameTH, s.surveyNameEN]));
  
        // group by licenseDetailID
        const groupMap = new Map<string, { licenseIndex: number; licenseDetailID: string; remainNetWeightKGM: number | null; maximumWeight: number | null; records: any[] }>();
        let indexCounter = 1;
  
        for (const item of data) {
          const licenseDetailID = item.description?.licenseDetailID ?? '__unknown__';
  
          if (!groupMap.has(licenseDetailID)) {
            groupMap.set(licenseDetailID, {
              licenseIndex: indexCounter++,
              licenseDetailID,
              remainNetWeightKGM: bufferRemainMap.get(licenseDetailID)?.remainNetWeightKGM ?? null,
              maximumWeight: bufferRemainMap.get(licenseDetailID)?.MaximumWeight ?? null,
              records: [],
            });
          }
  
          groupMap.get(licenseDetailID)!.records.push({
            jobID: item.jobID,
            quantity: item.quantity,
            totalNetWeight: item.totalNetWeight,
            loadingDetails: item.loadingDetails,
            riceName: item.riceName,
            vehicleName: item.description?.vehicleName,
            shippingDateTime: item.request?.shippingDateTime,
            surveyProvince: item.request?.surveyProvince,
            surveyName: surveyNameMap.get(item.request?.surveyLocateNameThai ?? '') || item.request?.surveyLocateNameThai,
            portName: item.request?.portName,
            requestBy: item.request?.requestBy,
          });
        }
  
        const result = [...groupMap.values()];

        const govData = await this.prisma.dataFromGoverment.findFirst({
          where: { licenseNumber },
          select: {
            licenseNumber: true,
            exporter: true,
            expiredDate: true,
            currency: true,
            exchangeRate: true,
           destinationCountry: true,
            licenseDetails: {
              select: {
                 licenseDetailID: true,
              netWeightTON: true,
              quantity: true,
              pricePerUnit: true,
             
                // productDescription: true,
               
              },
            },
          },
        });
  
        const govDataWithIndex = govData
          ? {
              ...govData,
              licenseDetails: govData.licenseDetails.map((detail, i) => ({
                index: i + 1,
                ...detail,
              })),
            }
          : govData;

        return response.status(200).send({
          message: 'License history retrieved successfully',
          govData: govDataWithIndex,
          data: result,
        });
      } catch (error) {
        return response.status(500).send({
          message: 'Failed to retrieve license history',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

  // async gethistoryCertificate(
  //   licenseNumber: string,
  //   request: any,
  //   response: any,
  // ): Promise<void> {
  //   // console.log('[CertificateService.gethistoryCertificate] licenseNumber:', licenseNumber);
  //   try {
  //     const certificatedetail = await this.prisma.dataFromGoverment.findMany({
  //       where: { licenseNumber: licenseNumber },
  //       select: { exporter: true, destinationCountry: true },
  //     });

  //     const certificateHistory = await this.prisma.certificatesheet.findMany({
  //       where: { licenseNumber: licenseNumber, status: true },
  //       select: {
  //         checkWeight: {
  //           select: {
  //             jobID: true,
  //             specialJob: true,
  //             goDown: true,
  //             grossWeight: true,
  //             netWeightTon: true,
  //             quantity: true,
  //             loadingDetails: true,
  //             riceName: true,
  //             vehicleName: true,
  //             request: {
  //               select: { shippingDateTime: true },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     const goDownList = [
  //       ...new Set(
  //         certificateHistory
  //           .map((item) => item.checkWeight?.goDown)
  //           .filter((value): value is string => Boolean(value)),
  //       ),
  //     ];

  //     const surveyNames = await this.prisma.surveyName.findMany({
  //       where: { surveyNameTH: { in: goDownList } },
  //       select: { surveyNameTH: true, surveyNameEN: true, changwat: true },
  //     });

  //     const surveyMap = new Map(
  //       surveyNames.map((item) => [
  //         item.surveyNameTH,
  //         { surveyNameEN: item.surveyNameEN, changwat: item.changwat },
  //       ]),
  //     );

  //     const result = certificateHistory.map((item, index) => {
  //       const surveyData = surveyMap.get(item.checkWeight?.goDown || '');
  //       return {
  //         index: (index + 1).toString(),
  //         ...item,
  //         checkWeight: {
  //           ...item.checkWeight,
  //           surveyName: surveyData?.surveyNameEN || item.checkWeight?.goDown || null,
  //           changwat: surveyData?.changwat || null,
  //         },
  //       };
  //     });

  //     // console.log('[CertificateService.gethistoryCertificate] returned', result.length, 'records');
  //     return response.status(200).send({ certificatedetail, result });
  //   } catch (error) {
  //     console.error('[CertificateService.gethistoryCertificate]', error);
  //     return response.status(500).send({ message: 'Failed to retrieve certificate history' });
  //   }
  // }
}
