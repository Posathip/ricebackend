import { Injectable, Req, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import {
  UpdateCheckWeightData,
  ValidateCheckWeightDto,
} from 'src/dto/recordNoti.dto';
import express, { Request, Response } from 'express';
import { FastifyReply } from 'fastify';
@Injectable()
export class RecordnotificationService {
  [x: string]: any;
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async getCheckWeightData(checkWeightID: string,  @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
    try {
      const checkWeightData = await this.prisma.validate_Check_Weight.findUnique({
        where: {
          checkWeightID: checkWeightID,
        },
        select: {
          checkWeightID: true,
          jobID: true,
          staffID: true,
          staffName: true,
          status: true,
          supplierName: true,
          time: true,
          noOfBags: true,
          grossWeight: true,
          netWeightW: true,
          netWeightTon: true,
          totalGrossWeight: true,
          totalNetWeight: true,
          totalTareWeight: true,
          remainWeight: true,
          weightPerTon: true,
          goDown: true,
          loadingDetails: true,
          specialJob: true,
          statusContinue: true,
          note: true,
          vehicleName: true,
          riceName: true,
          quantity: true,
          descriptionID: true,
          requestID: true,
        
          description: {
            select: {
              destination: true,
              licenseDetailID: true,
            },
          },
          request: {
            select: {
              licenseNumber: true,
              shippingDateTime: true,
              requestBy: true,
            },
          },
        },
      });

      if (!checkWeightData) {
        return response
          .status(404)
          .send({ message: 'No data found for the given check weight ID' });
      }

      const licenseDetailID = checkWeightData.description?.licenseDetailID;
      const bufferRemain = licenseDetailID
        ? await this.prisma.bufferRemain.findFirst({ where: { licenseDetailID } })
        : null;

      const companyData = await this.prisma.company.findFirst({
        where: {
          companyNameTH: checkWeightData.supplierName !== null
            ? checkWeightData.supplierName
            : undefined
        },
        select: { companyNameEN: true },
      });

      const result = {
        ...checkWeightData,
        supplierName: companyData?.companyNameEN || checkWeightData.supplierName,
        remainNetWeightKGM: bufferRemain?.remainNetWeightKGM ?? null,
      };



      return response
        .status(200)
        .send({
          message: 'Check weight data retrieved successfully',
          data: result,
        });
    } catch (error) {
      return response.status(500).send({
        message: 'Failed to retrieve check weight data',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getCheckWeightDataFilterDate(date: string, @Req() req: any, @Res({ passthrough: true }) response: FastifyReply) {
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return response.status(400).send({ message: 'Invalid date format' });
    }

    // 1. ดึงข้อมูล Validate_Check_Weight โดยกรองจากวันที่ในตาราง Request
    const checkWeightData = await this.prisma.validate_Check_Weight.findMany({
      where: {
        request: {
          requestDate: {
            gte: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()),
            lt: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate() + 1),
          }
        }
      },
      include: {
        request: {
          select: {
            licenseNumber: true,
            surveyLocateNameThai: true,
            surveyLocateNameEng: true,
            companyName: true, // ต้องดึงมาเพื่อใช้หาชื่อภาษาอังกฤษ
          },
        },
        description: {
          select: {
            destination: true,
          }
        }
      },
      orderBy: [
        { jobID: 'asc' },
        { specialJob: 'asc' },
      ],
    });

    if (!checkWeightData || checkWeightData.length === 0) {
      return response.status(404).send({
        message: 'No check weight data found for the given date',
      });
    }

    // 2. [Gather] รวบรวมชื่อบริษัททั้งหมดที่มีในผลลัพธ์
    const companyNames = [...new Set(checkWeightData.map(cw => cw.request?.companyName))].filter(Boolean);

    // 3. [Fetch] ดึงข้อมูลจากตาราง Company มาทีเดียว
    const companies = await this.prisma.company.findMany({
      where: {
        companyNameTH: { in: companyNames },
      },
      select: {
        companyNameTH: true,
        companyNameEN: true,
      }
    });

    // 4. [Map] ประกอบร่างข้อมูล (เหมือเดิมคือเพิ่ม companyNameEn และ Clean ชื่อบริษัทถ้าต้องการ)
    const result = checkWeightData.map(item => {
      const foundCompany = companies.find(c => c.companyNameTH === item.request?.companyName);
      
      return {
        ...item,
        request: {
          ...item.request,
          // แถม: ลบคำว่า "จำกัด" ออกตาม Logic ที่คุณเคย Comment ไว้
          companyName: item.request?.companyName?.replace(/จำกัด/g, '').trim() || '',
          companyNameEn: foundCompany?.companyNameEN ?? '',
        },
      };
    });

    return response.status(200).send({
      message: 'Check weight data retrieved successfully by date',
      data: result,
    });

  } catch (error) {
    console.error(error);
    return response.status(500).send({
      message: 'Failed to retrieve check weight data by date',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

  async updateCheckWeightData(
    checkWeightID: string,
    dto: UpdateCheckWeightData,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    try {
      const getlicense = await this.prisma.validate_Check_Weight.findUnique({
        where: { checkWeightID },
        include: { request: true, description: true },
      });
      // console.log(getlicense)
      if (!getlicense) {
        return response.status(404).send({ message: 'Check weight data not found' });
      }

      const licenseDetailID = (getlicense.description as any)?.licenseDetailID as string | undefined;
      if (!licenseDetailID) {
        return response.status(400).send({ message: 'Description has no licenseDetailID linked' });
      }

      const bufferRemain = await this.prisma.bufferRemain.findFirst({
        where: { licenseDetailID },
      });

      if (!bufferRemain) {
        return response.status(404).send({ message: 'BufferRemain not found for this license detail' });
      }

      const currentRemain = bufferRemain.remainNetWeightKGM ?? 0;

      let newRemain: number;

      if (!getlicense.status) {
        // First update: subtract new totalNetWeight from currentRemain
        if (currentRemain <= 0) {
          return response.status(400).send({
            message: 'Cannot update check weight data because remainNetWeightKGM is zero or negative',
          });
        }
        newRemain = currentRemain - (dto.totalNetWeight || 0);
        if (newRemain < 0) {
          return response.status(400).send({
            message: 'Cannot update: totalNetWeight exceeds remaining remainNetWeightKGM',
          });
        }
      } else {
        // Re-update: apply only the difference between new and old totalNetWeight
        const oldTotalNetWeight = getlicense.totalNetWeight || 0;
        const diff = (dto.totalNetWeight || 0) - oldTotalNetWeight;
        newRemain = currentRemain - diff;
        if (newRemain < 0) {
          return response.status(400).send({
            message: 'Cannot update: adjusted totalNetWeight exceeds remaining remainNetWeightKGM',
          });
        }
      }

      const updatedData = await this.prisma.validate_Check_Weight.update({
        where: { checkWeightID },
        data: dto,
      });

      await this.prisma.bufferRemain.update({
        where: { bufferRemainID: bufferRemain.bufferRemainID },
        data: { remainNetWeightKGM: newRemain },
      });

      if (!getlicense.status) {
        // First update: create certificatesheet
        await this.prisma.certificatesheet.create({
          data: {
            checkWeightID: updatedData.checkWeightID,
            jobID: getlicense.jobID || 0,
            licenseNumber: getlicense.request.licenseNumber || '',
            index: getlicense.description?.index || 0,
            specialJob: getlicense.specialJob || '',
            companyName: getlicense.request.companyName || '',
            surveyLocateNameThai: getlicense.request.surveyLocateNameThai || '',
            portName: getlicense.request.portName || '',
            destination: getlicense.description?.destination || '',
            riceType: getlicense.description?.riceType || '',
            quantity: getlicense.description?.quantity || 0,
            totalGrossWeight: updatedData.totalGrossWeight || 0,
            totalTareWeight: updatedData.totalTareWeight || 0,
            totalNettWeight: updatedData.totalNetWeight || 0,
            shipper: getlicense.request.requestBy || '',
            dateCheckWeight: getlicense.request.requestDate || new Date(),
            marks: 'xxxxxxx',
            status: false,
            applyGodown: true,
          },
        });
      } else {
        // Re-update: update existing certificatesheet weights
        await this.prisma.certificatesheet.update({
          where: { checkWeightID: updatedData.checkWeightID },
          data: {
            totalGrossWeight: updatedData.totalGrossWeight || 0,
            totalTareWeight: updatedData.totalTareWeight || 0,
            totalNettWeight: updatedData.totalNetWeight || 0,
          },
        });
      }

      return response.status(200).send({
        message: 'Check weight data and addcertificatesheet already updated successfully',
        data: updatedData,
      });
    } catch (error) {
      return response.status(500).send({
        message: 'Failed to update check weight data',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getLicenseHistory(licenseNumber: string, @Req() request: any, @Res({ passthrough: true }) response: FastifyReply) {
    try {
      const data = await this.prisma.validate_Check_Weight.findMany({
        where: {
          status: true,
          description: { licenseNumber },
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

  async postData(dtoArray: ValidateCheckWeightDto[],  @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
  try {
  const requestIds = dtoArray.map((dto) => dto.requestID);
  const descriptionIds = dtoArray.map((dto) => dto.descriptionID);

  // 1️⃣ Check existing records
  const existingRecords = await this.prisma.validate_Check_Weight.findMany({
    where: {
      descriptionID: { in: descriptionIds },
    },
    select: { descriptionID: true },
  });

  const existingDescriptionIds = new Set(
    existingRecords.map((r) => r.descriptionID)
  );

  // 2️⃣ Fetch related data (for insert logic)
  const requests = await this.prisma.request.findMany({
    where: { requestID: { in: requestIds } },
  });

  const descriptions = await this.prisma.description.findMany({
    where: { descriptionID: { in: descriptionIds } },
  });

  const descriptionMap = new Map(descriptions.map((d) => [d.descriptionID, d]));
  const requestMap = new Map(requests.map((r) => [r.requestID, r]));

  // 3️⃣ Loop through DTOs
  for (const dto of dtoArray) {
    if (existingDescriptionIds.has(dto.descriptionID)) {
      // === UPDATE existing record ===
      const desc = descriptionMap.get(dto.descriptionID);
      const req = requestMap.get(dto.requestID);

      const updatePayload: any = {
        status: false,
        staffID: dto.staffID,
        jobID: dto.jobID,
        note: dto.note,
        statusContinue: dto.statusContinue,
        staffName: dto.staffName,
        specialJob: dto.specialJob || null,
      };

      if (desc) {
        updatePayload.vehicleName = desc.vehicleName;
        updatePayload.riceName = desc.riceType;
        updatePayload.noOfBags = desc.quantity;
        updatePayload.grossWeight = desc.grossWeight;
        updatePayload.netWeightW = desc.netWeightW;
        updatePayload.netWeightTon = desc.netWeightTON;
      }

      if (req) {
        updatePayload.goDown = req.portName;
        updatePayload.time = req.shippingDateTime;
        updatePayload.supplierName = req.companyName;
      }

      await this.prisma.validate_Check_Weight.updateMany({
        where: { descriptionID: dto.descriptionID },
        data: updatePayload,
      });
    } else {
      // === CREATE new record (original logic) ===
      const desc = descriptionMap.get(dto.descriptionID);
      const req = requestMap.get(dto.requestID);

      await this.prisma.validate_Check_Weight.create({
        data: {
          descriptionID: dto.descriptionID,
          requestID: dto.requestID,
          status: false,
          staffID: dto.staffID,
          jobID: dto.jobID,
          note: dto.note,
          statusContinue: dto.statusContinue,
          staffName: dto.staffName,
          specialJob: dto.specialJob || null,
          vehicleName: desc?.vehicleName || null,
          riceName: desc?.riceType || null,
          noOfBags: desc?.quantity || null,
          grossWeight: desc?.grossWeight || null,
          netWeightW: desc?.netWeightW || null,
          netWeightTon: desc?.netWeightTON || null,
          goDown: req?.portName || null,
          time: req?.shippingDateTime || null,
          supplierName: req?.companyName || null,
        },
      });
    }
  }

  // 4️⃣ Update request status
  await this.prisma.request.updateMany({
    where: { requestID: { in: requestIds } },
    data: { status: 'completed' },
  });

  return {
    message: 'Successfully processed check weight data',
    updated: Array.from(existingDescriptionIds).length,
    created: dtoArray.length - existingDescriptionIds.size,
  };
} catch (error) {
  return response.status(500).send({
    message: 'Failed to post or update data',
    error: error instanceof Error ? error.message : String(error),
  });
}
}
  async getCheckWeightDataFilterjobNoandid(jobNo: number,licenseId: string,  @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,){

      try {
        const query = await this.prisma.validate_Check_Weight.findMany({
          where: {
            OR: [
              { jobID: jobNo },
              { request: { licenseNumber: licenseId } },
            ],
          },
          include: {
            request: true,
          },
        });
        if (!query || query.length === 0) {
          return response.status(404).send({
            message: 'No check weight data found for the given jobNo and licenseId',
          });
        }
        return response.status(200).send({
          message: 'Check weight data retrieved successfully by jobNo and licenseId',
          data: query,
        });
      } catch (error) {
        return response.status(500).send({
          message: 'Failed to retrieve check weight data by jobNo and licenseId',
          error: error instanceof Error ? error.message : String(error),
        });
      }
  }
}
