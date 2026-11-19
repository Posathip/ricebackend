import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, orderBill } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { rethrowAsHttpException } from 'src/common/service-error';
import {
  CreateExtraInvoiceDto,
  CreatePhysicalAnalysisDto,
  CreateSellingLiquidsDto,
  UpdateDataAnalysisDto,
  UpdateExtraInvoiceDto,
  UpdateOrderStatusDto,
  UpdateSellingLiquidsDto,
} from 'src/dto/orderBill.dto';

const ORDER_BILL_DETAIL_INCLUDE = {
  physicalAnalyses: true,
  extraInvoices: true,
  sellingLiquids: true,
} satisfies Prisma.orderBillInclude;

export type OrderBillDetail = Prisma.orderBillGetPayload<{ include: typeof ORDER_BILL_DETAIL_INCLUDE }>;

export interface MessageResponse {
  message: string;
}

export interface MessageDataResponse<T> extends MessageResponse {
  data: T;
}

@Injectable()
export class OrderbillService {
  constructor(private readonly prisma: PrismaService) {}

  async createPhysicalAnalysis(dto: CreatePhysicalAnalysisDto): Promise<MessageResponse> {
    console.log('[OrderbillService.createPhysicalAnalysis] orderNo:', dto.orderNo);
    try {
      const billDate = new Date(dto.date);
      const created = await this.prisma.orderBill.create({
        data: {
          status: dto.status,
          date: billDate,
          physicalAnalyses: {
            create: {
              orderNo: dto.orderNo,
              date: billDate,
              companyName: dto.companyName,
              physicalAnalysis: dto.physicalAnalysis,
              physicalChemical: dto.physicalChemical,
              totalPrice: dto.totalPrice,
              note: dto.note,
            },
          },
        },
      });
      console.log('[OrderbillService.createPhysicalAnalysis] result:', created.orderBillID);
      return { message: 'Order bill data created successfully' };
    } catch (error) {
      rethrowAsHttpException('OrderbillService.createPhysicalAnalysis', error);
    }
  }

  async createExtraInvoice(dto: CreateExtraInvoiceDto): Promise<MessageResponse> {
    console.log('[OrderbillService.createExtraInvoice] orderNo:', dto.orderNo);
    try {
      const billDate = new Date(dto.date);
      const created = await this.prisma.orderBill.create({
        data: {
          status: dto.status,
          date: billDate,
          extraInvoices: {
            create: {
              orderNo: dto.orderNo,
              companyName: dto.companyName,
              numberSample: dto.numberSample,
              pricePerUnit: dto.pricePerUnit,
              totalPrice: dto.totalPrice,
              note: dto.note,
              date: billDate,
            },
          },
        },
      });
      console.log('[OrderbillService.createExtraInvoice] result:', created.orderBillID);
      return { message: 'Extra invoice data created successfully' };
    } catch (error) {
      rethrowAsHttpException('OrderbillService.createExtraInvoice', error);
    }
  }

  async createSellingLiquids(dto: CreateSellingLiquidsDto): Promise<MessageResponse> {
    console.log('[OrderbillService.createSellingLiquids] orderNo:', dto.orderNo);
    try {
      const billDate = new Date(dto.date);
      const created = await this.prisma.orderBill.create({
        data: {
          status: dto.status,
          date: billDate,
          sellingLiquids: {
            create: {
              orderNo: dto.orderNo,
              companyName: dto.companyName,
              date: billDate,
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
      console.log('[OrderbillService.createSellingLiquids] result:', created.orderBillID);
      return { message: 'Order Liquid data created successfully' };
    } catch (error) {
      rethrowAsHttpException('OrderbillService.createSellingLiquids', error);
    }
  }

  async getOrderBillsByDate(date: string): Promise<MessageDataResponse<orderBill[]>> {
    console.log('[OrderbillService.getOrderBillsByDate] date:', date);
    try {
      const orderBills = await this.prisma.orderBill.findMany({
        where: { date: this.buildDayRange(date) },
      });
      if (orderBills.length === 0) {
        throw new NotFoundException('No order bill data found for the given date');
      }
      console.log('[OrderbillService.getOrderBillsByDate] result count:', orderBills.length);
      return { message: 'Order bill data retrieved successfully by date', data: orderBills };
    } catch (error) {
      rethrowAsHttpException('OrderbillService.getOrderBillsByDate', error);
    }
  }

  async deleteOrderBill(orderBillID: string): Promise<MessageResponse> {
    console.log('[OrderbillService.deleteOrderBill] orderBillID:', orderBillID);
    try {
      const orderBill = await this.prisma.orderBill.findUnique({ where: { orderBillID } });
      if (!orderBill) throw new NotFoundException('Order bill data not found');

      await this.prisma.orderBill.delete({ where: { orderBillID } });
      console.log('[OrderbillService.deleteOrderBill] result deleted:', orderBillID);
      return { message: 'Order bill data deleted successfully' };
    } catch (error) {
      rethrowAsHttpException('OrderbillService.deleteOrderBill', error);
    }
  }

  async getOrderBillDetail(orderBillID: string): Promise<MessageDataResponse<OrderBillDetail>> {
    console.log('[OrderbillService.getOrderBillDetail] orderBillID:', orderBillID);
    try {
      const orderBillDetail = await this.prisma.orderBill.findUnique({
        where: { orderBillID },
        include: ORDER_BILL_DETAIL_INCLUDE,
      });
      if (!orderBillDetail) throw new NotFoundException('Order bill data not found');

      console.log('[OrderbillService.getOrderBillDetail] result:', orderBillDetail.orderBillID);
      return { message: 'Order bill data retrieved successfully', data: orderBillDetail };
    } catch (error) {
      rethrowAsHttpException('OrderbillService.getOrderBillDetail', error);
    }
  }

  async updateStatus(dto: UpdateOrderStatusDto): Promise<MessageResponse> {
    console.log('[OrderbillService.updateStatus] status:', dto.status, 'count:', dto.order?.length);
    try {
      if (!dto.order?.length) {
        throw new BadRequestException('No order bills provided for status update');
      }
      const orderBillIds = dto.order
        .map((item) => item.orderbillID)
        .filter((id): id is string => id !== undefined);

      const { count } = await this.prisma.orderBill.updateMany({
        where: { orderBillID: { in: orderBillIds } },
        data: { status: dto.status },
      });
      console.log('[OrderbillService.updateStatus] result updated:', count);
      return { message: 'Order bill status updated successfully' };
    } catch (error) {
      rethrowAsHttpException('OrderbillService.updateStatus', error);
    }
  }

  async updatePhysicalAnalysis(
    physicalAnalysisID: string,
    dto: UpdateDataAnalysisDto,
  ): Promise<MessageResponse> {
    console.log('[OrderbillService.updatePhysicalAnalysis] physicalAnalysisID:', physicalAnalysisID);
    try {
      const physicalAnalysis = await this.prisma.physicalAnalysis.findUnique({
        where: { physicalAnalysisID },
      });
      if (!physicalAnalysis) {
        throw new NotFoundException('Physical analysis data not found for the given order bill ID');
      }

      await this.prisma.physicalAnalysis.update({ where: { physicalAnalysisID }, data: dto });
      console.log('[OrderbillService.updatePhysicalAnalysis] result updated:', physicalAnalysisID);
      return { message: 'Physical analysis data updated successfully' };
    } catch (error) {
      rethrowAsHttpException('OrderbillService.updatePhysicalAnalysis', error);
    }
  }

  async updateExtraInvoice(extraInvoiceID: string, dto: UpdateExtraInvoiceDto): Promise<MessageResponse> {
    console.log('[OrderbillService.updateExtraInvoice] extraInvoiceID:', extraInvoiceID);
    try {
      const extraInvoice = await this.prisma.extraInvoice.findUnique({ where: { extraInvoiceID } });
      if (!extraInvoice) {
        throw new NotFoundException('Extra invoice data not found for the given order bill ID');
      }

      await this.prisma.extraInvoice.update({ where: { extraInvoiceID }, data: dto });
      console.log('[OrderbillService.updateExtraInvoice] result updated:', extraInvoiceID);
      return { message: 'Extra invoice data updated successfully' };
    } catch (error) {
      rethrowAsHttpException('OrderbillService.updateExtraInvoice', error);
    }
  }

  async updateSellingLiquids(
    sellingLiquidsID: string,
    dto: UpdateSellingLiquidsDto,
  ): Promise<MessageResponse> {
    console.log('[OrderbillService.updateSellingLiquids] sellingLiquidsID:', sellingLiquidsID);
    try {
      const sellingLiquids = await this.prisma.sellingLiquids.findUnique({ where: { sellingLiquidsID } });
      if (!sellingLiquids) {
        throw new NotFoundException('Selling liquids data not found for the given order bill ID');
      }

      await this.prisma.sellingLiquids.update({ where: { sellingLiquidsID }, data: dto });
      console.log('[OrderbillService.updateSellingLiquids] result updated:', sellingLiquidsID);
      return { message: 'Selling liquids data updated successfully' };
    } catch (error) {
      rethrowAsHttpException('OrderbillService.updateSellingLiquids', error);
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private buildDayRange(date: string): { gte: Date; lt: Date } {
    const parsed = new Date(date);
    const year = parsed.getFullYear();
    const month = parsed.getMonth();
    const day = parsed.getDate();
    return { gte: new Date(year, month, day), lt: new Date(year, month, day + 1) };
  }
}
