import { Injectable, Req, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FastifyReply } from 'fastify';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateDataAnalysisDto, UpdateExtraInvoiceDto, UpdateOrderStatusDto, UpdateSellingLiquidsDto } from 'src/dto/orderBill.dto';


@Injectable()
export class OrderbillService {
    [x: string]: any;
      constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
      ) {}

      async postDataAnalysis(
        dto: any,
        @Req() request: any,
        @Res({ passthrough: true }) response: FastifyReply,
      ) {
        try {
          const orderBillData = await this.prisma.orderBill.create({
              data: {
                status: dto.status,
                date: new Date(dto.date),
                  physicalAnalyses:{
                    create:{ 
                        orderNo        :dto.orderNo,
                        date           :new Date(dto.date),
                        companyName    :dto.companyName,
                        physicalAnalysis: dto.physicalAnalysis,
                        physicalChemical: dto.physicalChemical,
                        totalPrice     :dto.totalPrice,
                        note           :dto.note,

                    }

                  }
              }
          });
          return response.status(200).send({
            message: 'Order bill data created successfully',
      
          });
        } catch (error) {
          return response.status(500).send({
            message: 'Failed to create order bill data',
            error: error.message || error,
          });
        }
      }

      async postDataExtrainvoice ( dto: any,
        @Req() request: any,
        @Res({ passthrough: true }) response: FastifyReply,){
            try {
                const adddataExtrainvoice = await this.prisma.orderBill.create({
                    data:{
                        status: dto.status,
                                        date: new Date(dto.date),
                          extraInvoices :{
                            create:{
    orderNo        :dto.orderNo,
    companyName    :dto.companyName,
    numberSample   :dto.numberSample,
    pricePerUnit   :dto.pricePerUnit,
    totalPrice     :dto.totalPrice,
    note           :dto.note,
    date           :new Date(dto.date),
                           
                            }
                          }
                    }
                })
                return response.status(200).send({
                    message: 'Extra invoice data created successfully',
                    
                });
            } catch (error) {
                return response.status(500).send({
                    message: 'Failed to create extra invoice data',
                    error: error.message || error,
                  });
                
            }

      }


      async postDataSellingLiquids (    dto: any,
        @Req() request: any,
        @Res({ passthrough: true }) response: FastifyReply,    ){
        try {
           
             const adddataExtrainvoice = await this.prisma.orderBill.create({
                    data:{
                        status: dto.status,
                                        date: new Date(dto.date),
                         sellingLiquids :{
                            create:{
    orderNo        :dto.orderNo,
    companyName    :dto.companyName,
    date           :new Date(dto.date),
    liquidsBoolean :dto.liquidsBoolean,
    numberNo1      :dto.numberNo1,
    pricePerUnitNo1: dto.pricePerUnitNo1,
    totalPriceNo1  :dto.totalPriceNo1,
    numberNo2      :dto.numberNo2,
    pricePerUnitNo2: dto.pricePerUnitNo2,
    totalPriceNo2  :dto.totalPriceNo2,

                           
                            }
                          }
                    }
                })
                return response.status(200).send({
                    message: 'Order Liquid data created successfully',
                    
                });
        } catch (error) {
            return response.status(500).send({
                message: 'Failed to create selling liquids data',
                error: error.message || error,
              });
        }
      }

      async getOrderBillDataByDate(date,
          @Req() request: any,
        @Res({ passthrough: true }) response: FastifyReply,
      ){
try {
     const parsedDate = new Date(date);
    const getOrderByDate = await this.prisma.orderBill.findMany({
        where: {
            date: {
               gte:  new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()),
        lt: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate() + 1),
            },
        },
    });
    if (!getOrderByDate || getOrderByDate.length === 0) {
        return response.status(404).send({
            message: 'No order bill data found for the given date',
        });
    }
    return response.status(200).send({
        message: 'Order bill data retrieved successfully by date',
        data: getOrderByDate,
    });
} catch (error) {
        return response.status(500).send({
          message: 'Failed to retrieve order bill data by date',
          error: error.message || error,
        });
      }
}
      
async deleteOrderBillData(orderBillID,@Req() request: any,
        @Res({ passthrough: true }) response: FastifyReply,){
    try {
        const orderBillData = await this.prisma.orderBill.findUnique({
            where: { orderBillID: orderBillID },
        });
        if (!orderBillData) {
            return response.status(404).send({
                message: 'Order bill data not found',
            }); 
        }
        const deletedata = await this.prisma.orderBill.delete({
            where: { orderBillID: orderBillID },
        });
       
        return response.status(200).send({
            message: 'Order bill data deleted successfully',
        });
    } catch (error) {
        return response.status(500).send({
            message: 'Failed to delete order bill data',
            error: error.message || error,
          });
        
    }
}

async getOrderBillDataDetail(orderBillID, @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
    try {
        const getorderbilldetail = await this.prisma.orderBill.findUnique({
            where: { orderBillID: orderBillID },
            include: {
                physicalAnalyses: true,
                extraInvoices: true,
                sellingLiquids: true,
            },
        });
        if (!getorderbilldetail) {
            return response.status(404).send({
                message: 'Order bill data not found',
            });
        }
        return response.status(200).send({
            message: 'Order bill data retrieved successfully',
            data: getorderbilldetail,
        });
    } catch (error) {
        return response.status(500).send({
            message: 'Failed to retrieve order bill data detail',
            error: error.message || error,
          }); 
    }
}


async updateStatus(dto: UpdateOrderStatusDto,@Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,

){

    try {
       if(dto.order.length === 0) {
    return response.status(400).send({
      message: 'No order bills provided for status update',
    });
  }

  const updatestatus = await this.prisma.orderBill.updateMany({
    where: {
      orderBillID: {
        in: dto.order.map((bill) => bill.orderbillID),  // ใช้ orderbillID ตาม DTO
      },
    },
    data: {
      status: dto.status,
    },
  });
        return response.status(200).send({
            message: 'Order bill status updated successfully',

        });

    } catch (error) {
        return response.status(500).send({
            message: 'Failed to update status',
            error: error.message || error,
          });
    }
}

async updatedataanalysis( physicalAnalysisID, dto: UpdateDataAnalysisDto, @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) { 
  try {
    const finddata = await this.prisma.physicalAnalysis.findUnique({
      where: { physicalAnalysisID:physicalAnalysisID },
    });
    if (!finddata) {
      return response.status(404).send({
        message: 'Physical analysis data not found for the given order bill ID',
      });
    }
    const updatedata = await this.prisma.physicalAnalysis.update({
      where: { physicalAnalysisID: physicalAnalysisID },
      data: dto,
    });
  } catch (error) {
    return response.status(500).send({
      message: 'Failed to update physical analysis data',
      error: error.message || error,
    });
    
  }
}

async updatedataextrainvoice(extrainvoiceID,dto: UpdateExtraInvoiceDto, @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) { 
  try {
    const finddata = await this.prisma.extraInvoice.findUnique({
      where: { extraInvoiceID:extrainvoiceID },
      
    });
    if (!finddata) {
      return response.status(404).send({
        message: 'Extra invoice data not found for the given order bill ID',
      });
    }
    const updatedata = await this.prisma.extraInvoice.update({
      where: { extraInvoiceID: extrainvoiceID },
      data: dto,
    });
    return response.status(200).send({
      message: 'Extra invoice data updated successfully',

    });
  } catch (error) {
    return response.status(500).send({
      message: 'Failed to update extra invoice data',
      error: error.message || error,
    });
    
  }

}

async updatedatasellingliquids(sellingLiquidsID,dto: UpdateSellingLiquidsDto, @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
  try {
    const finddata = await this.prisma.sellingLiquids.findUnique({
      where: { sellingLiquidsID:sellingLiquidsID },
    });
    if (!finddata) {
      return response.status(404).send({
        message: 'Selling liquids data not found for the given order bill ID',
      });
    }
    const updatedata = await this.prisma.sellingLiquids.update({
      where: { sellingLiquidsID: sellingLiquidsID },
      data: dto,
    });
    return response.status(200).send({
      message: 'Selling liquids data updated successfully',
    });
    
  } catch (error) {
    return response.status(500).send({
      message: 'Failed to update selling liquids data',
      error: error.message || error,
    });
    
  }
}
    }
