import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FastifyReply } from 'fastify';
import { PrismaService } from 'prisma/prisma.service';
import {
  UpdateDataAnalysisDto,
  UpdateExtraInvoiceDto,
  UpdateOrderStatusDto,
  UpdateSellingLiquidsDto,
} from 'src/dto/orderBill.dto';

@Injectable()
export class OrderbillService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async postDataAnalysis(
    dto: any,
    request: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[OrderbillService.postDataAnalysis] orderNo:', dto.orderNo);
    try {
      await this.prisma.orderBill.create({
        data: {
          status: dto.status,
          date: new Date(dto.date),
          physicalAnalyses: {
            create: {
              orderNo: dto.orderNo,
              date: new Date(dto.date),
              companyName: dto.companyName,
              physicalAnalysis: dto.physicalAnalysis,
              physicalChemical: dto.physicalChemical,
              totalPrice: dto.totalPrice,
              note: dto.note,
            },
          },
        },
      });

      // console.log('[OrderbillService.postDataAnalysis] created successfully');
      return response.status(200).send({ message: 'Order bill data created successfully' });
    } catch (error) {
      console.error('[OrderbillService.postDataAnalysis]', error);
      return response.status(500).send({
        message: 'Failed to create order bill data',
        error: error,
      });
    }
  }

  async postDataExtrainvoice(
    dto: any,
    request: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[OrderbillService.postDataExtrainvoice] orderNo:', dto.orderNo);
    try {
      await this.prisma.orderBill.create({
        data: {
          status: dto.status,
          date: new Date(dto.date),
          extraInvoices: {
            create: {
              orderNo: dto.orderNo,
              companyName: dto.companyName,
              numberSample: dto.numberSample,
              pricePerUnit: dto.pricePerUnit,
              totalPrice: dto.totalPrice,
              note: dto.note,
              date: new Date(dto.date),
            },
          },
        },
      });

      // console.log('[OrderbillService.postDataExtrainvoice] created successfully');
      return response.status(200).send({ message: 'Extra invoice data created successfully' });
    } catch (error) {
      console.error('[OrderbillService.postDataExtrainvoice]', error);
      return response.status(500).send({
        message: 'Failed to create extra invoice data',
        error: error,
      });
    }
  }

  async postDataSellingLiquids(
    dto: any,
    request: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[OrderbillService.postDataSellingLiquids] orderNo:', dto.orderNo);
    try {
      await this.prisma.orderBill.create({
        data: {
          status: dto.status,
          date: new Date(dto.date),
          sellingLiquids: {
            create: {
              orderNo: dto.orderNo,
              companyName: dto.companyName,
              date: new Date(dto.date),
              liquidsBoolean: dto.liquidsBoolean,
              numberNo1: dto.numberNo1,
              pricePerUnitNo1: dto.pricePerUnitNo1,
              totalPriceNo1: dto.totalPriceNo1,
              numberNo2: dto.numberNo2,
              pricePerUnitNo2: dto.pricePerUnitNo2,
              totalPriceNo2: dto.totalPriceNo2,
            },
          },
        },
      });

      // console.log('[OrderbillService.postDataSellingLiquids] created successfully');
      return response.status(200).send({ message: 'Order Liquid data created successfully' });
    } catch (error) {
      console.error('[OrderbillService.postDataSellingLiquids]', error);
      return response.status(500).send({
        message: 'Failed to create selling liquids data',
        error: error,
      });
    }
  }

  async getOrderBillDataByDate(
    date: string,
    request: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[OrderbillService.getOrderBillDataByDate] date:', date);
    try {
      const parsedDate = new Date(date);
      const getOrderByDate = await this.prisma.orderBill.findMany({
        where: {
          date: {
            gte: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()),
            lt: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate() + 1),
          },
        },
      });

      if (!getOrderByDate || getOrderByDate.length === 0) {
        // console.log('[OrderbillService.getOrderBillDataByDate] no data found');
        return response.status(404).send({
          message: 'No order bill data found for the given date',
        });
      }

      // console.log('[OrderbillService.getOrderBillDataByDate] returned', getOrderByDate.length, 'records');
      return response.status(200).send({
        message: 'Order bill data retrieved successfully by date',
        data: getOrderByDate,
      });
    } catch (error) {
      console.error('[OrderbillService.getOrderBillDataByDate]', error);
      return response.status(500).send({
        message: 'Failed to retrieve order bill data by date',
        error: error,
      });
    }
  }

  async deleteOrderBillData(
    orderBillID: string,
    request: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[OrderbillService.deleteOrderBillData] orderBillID:', orderBillID);
    try {
      const orderBillData = await this.prisma.orderBill.findUnique({
        where: { orderBillID: orderBillID },
      });

      if (!orderBillData) {
        // console.log('[OrderbillService.deleteOrderBillData] not found:', orderBillID);
        return response.status(404).send({ message: 'Order bill data not found' });
      }

      await this.prisma.orderBill.delete({ where: { orderBillID: orderBillID } });

      // console.log('[OrderbillService.deleteOrderBillData] deleted:', orderBillID);
      return response.status(200).send({ message: 'Order bill data deleted successfully' });
    } catch (error) {
      console.error('[OrderbillService.deleteOrderBillData]', error);
      return response.status(500).send({
        message: 'Failed to delete order bill data',
        error: error,
      });
    }
  }

  async getOrderBillDataDetail(
    orderBillID: string,
    request: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[OrderbillService.getOrderBillDataDetail] orderBillID:', orderBillID);
    try {
      const detail = await this.prisma.orderBill.findUnique({
        where: { orderBillID: orderBillID },
        include: {
          physicalAnalyses: true,
          extraInvoices: true,
          sellingLiquids: true,
        },
      });

      if (!detail) {
        // console.log('[OrderbillService.getOrderBillDataDetail] not found:', orderBillID);
        return response.status(404).send({ message: 'Order bill data not found' });
      }

      // console.log('[OrderbillService.getOrderBillDataDetail] found:', detail.orderBillID);
      return response.status(200).send({
        message: 'Order bill data retrieved successfully',
        data: detail,
      });
    } catch (error) {
      console.error('[OrderbillService.getOrderBillDataDetail]', error);
      return response.status(500).send({
        message: 'Failed to retrieve order bill data detail',
        error: error,
      });
    }
  }

  async updateStatus(
    dto: UpdateOrderStatusDto,
    request: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[OrderbillService.updateStatus] status:', dto.status);
    try {
      if (!dto.order?.length) {
        return response.status(400).send({
          message: 'No order bills provided for status update',
        });
      }

      await this.prisma.orderBill.updateMany({
        where: {
          orderBillID: {
            in: dto.order
              .map((bill) => bill.orderbillID)
              .filter((id): id is string => id !== undefined),
          },
        },
        data: { status: dto.status },
      });

      // console.log('[OrderbillService.updateStatus] updated', dto.order.length, 'bills to status:', dto.status);
      return response.status(200).send({ message: 'Order bill status updated successfully' });
    } catch (error) {
      console.error('[OrderbillService.updateStatus]', error);
      return response.status(500).send({
        message: 'Failed to update status',
        error: error,
      });
    }
  }

  async updatedataanalysis(
    physicalAnalysisID: string,
    dto: UpdateDataAnalysisDto,
    request: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[OrderbillService.updatedataanalysis] physicalAnalysisID:', physicalAnalysisID);
    try {
      const finddata = await this.prisma.physicalAnalysis.findUnique({
        where: { physicalAnalysisID: physicalAnalysisID },
      });

      if (!finddata) {
        // console.log('[OrderbillService.updatedataanalysis] not found:', physicalAnalysisID);
        return response.status(404).send({
          message: 'Physical analysis data not found for the given order bill ID',
        });
      }

      await this.prisma.physicalAnalysis.update({
        where: { physicalAnalysisID: physicalAnalysisID },
        data: dto,
      });

      // console.log('[OrderbillService.updatedataanalysis] updated:', physicalAnalysisID);
      return response.status(200).send({ message: 'Physical analysis data updated successfully' });
    } catch (error) {
      console.error('[OrderbillService.updatedataanalysis]', error);
      return response.status(500).send({
        message: 'Failed to update physical analysis data',
        error: error,
      });
    }
  }

  async updatedataextrainvoice(
    extrainvoiceID: string,
    dto: UpdateExtraInvoiceDto,
    request: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[OrderbillService.updatedataextrainvoice] extrainvoiceID:', extrainvoiceID);
    try {
      const finddata = await this.prisma.extraInvoice.findUnique({
        where: { extraInvoiceID: extrainvoiceID },
      });

      if (!finddata) {
        // console.log('[OrderbillService.updatedataextrainvoice] not found:', extrainvoiceID);
        return response.status(404).send({
          message: 'Extra invoice data not found for the given order bill ID',
        });
      }

      await this.prisma.extraInvoice.update({
        where: { extraInvoiceID: extrainvoiceID },
        data: dto,
      });

      // console.log('[OrderbillService.updatedataextrainvoice] updated:', extrainvoiceID);
      return response.status(200).send({ message: 'Extra invoice data updated successfully' });
    } catch (error) {
      console.error('[OrderbillService.updatedataextrainvoice]', error);
      return response.status(500).send({
        message: 'Failed to update extra invoice data',
        error: error,
      });
    }
  }

  async updatedatasellingliquids(
    sellingLiquidsID: string,
    dto: UpdateSellingLiquidsDto,
    request: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[OrderbillService.updatedatasellingliquids] sellingLiquidsID:', sellingLiquidsID);
    try {
      const finddata = await this.prisma.sellingLiquids.findUnique({
        where: { sellingLiquidsID: sellingLiquidsID },
      });

      if (!finddata) {
        // console.log('[OrderbillService.updatedatasellingliquids] not found:', sellingLiquidsID);
        return response.status(404).send({
          message: 'Selling liquids data not found for the given order bill ID',
        });
      }

      await this.prisma.sellingLiquids.update({
        where: { sellingLiquidsID: sellingLiquidsID },
        data: dto,
      });

      // console.log('[OrderbillService.updatedatasellingliquids] updated:', sellingLiquidsID);
      return response.status(200).send({ message: 'Selling liquids data updated successfully' });
    } catch (error) {
      console.error('[OrderbillService.updatedatasellingliquids]', error);
      return response.status(500).send({
        message: 'Failed to update selling liquids data',
        error: error,
      });
    }
  }
}
