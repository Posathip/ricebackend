import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { FastifyReply } from 'fastify';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

@Get('filterstatisticdata')
@ApiOkResponse({
  
  description: 'Statistic data (Excel format)',
  schema: {
    example: {
      data: [
        {
          'ลำดับที่': 1,
          ปี: "68",
          ปริมาณต่อตัน: null,
          ชนิดข้าว: "ข้าวเจ้าขาวหอมมะลิไทย 100 %",
          เรือใหญ่: "เรือหางยาว",
          'index': 1,
          ผู้ได้รับอนุญาติส่งออก: "อุทัย โปรดิวส์ จำกัด",
          destination: "CANADA",
          jobiD: 1,
          loadingDetails: "",
          supplierName: "อุทัย โปรดิวส์ จำกัด",
          ผู้ส่งมอบ: "ท่าเรือกรุงเทพ/แหลมฉบัง",
          ราคา: 1128,
          อัตราแลกเปลี่ยน: 32.4352,
          เพิ่มเติม: "ข้าวเจ้าขาวหอมมะลิไทย 100 %",
        },
      ],
    },
  },
})

getStatisticData(
  @Req() request: any,
  @Res({ passthrough: true }) response: FastifyReply,
  @Query('startdate') startdate: string,
  @Query('enddate') enddate: string,
  

) {
  return this.statisticService.getStatisticData(startdate, enddate,request, response);
}
}