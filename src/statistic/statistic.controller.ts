import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { StatisticRow, StatisticService } from './statistic.service';

const STATISTIC_ROW_EXAMPLE = {
  'ลำดับที่': 1,
  'ผู้ได้รับอนุญาติส่งออก': 'โรงสีเอกไรซ์ จำกัด',
  'ผู้ส่งมอบ': 'K.V.C. RICE INTERTRADE',
  'เข้าตู้': '✓',
  'รายการที่': 1,
  'ปี': '69',
  'เลขใบอนุญาต': '19555',
  'คำสั่งจ่างงานที่': 70,
  'เรือใหญ่': 'xTest',
  'เมืองตราส่ง': 'HONG KONG',
  'ชนิดข้าว EN': 'WHITE RICE 15%',
  'ปริมาณต่อตัน': 26.5,
  T: 'ข้าวขาวตัญขาว',
  'CODE 1': '4 W R 15',
  '(Space1)': null,
  'CODE 2': 'ข้าวขาว 15',
  '(Space2)': null,
  'ราคา': 615,
  'อัตราแลกเปลี่ยน': 31.8975,
  'ชื่อข้าวไทย': 'ข้าวขาว 15%',
};

@ApiTags('Statistic')
@ApiBearerAuth()
@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('filterstatisticdata')
  @ApiOperation({ summary: 'Get certified check-weight statistics in Excel row format' })
  @ApiQuery({ name: 'startdate', example: '2026-05-01T00:00:00.000Z' })
  @ApiQuery({ name: 'enddate', example: '2026-05-31T23:59:59.999Z' })
  @ApiOkResponse({
    description: 'Statistic rows (Excel format, Thai column headers)',
    schema: { example: [STATISTIC_ROW_EXAMPLE] },
  })
  getStatisticData(
    @Query('startdate') startDate: string,
    @Query('enddate') endDate: string,
  ): Promise<StatisticRow[]> {
    return this.statisticService.getStatisticData(startDate, endDate);
  }
}
