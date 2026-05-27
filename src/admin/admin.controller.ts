import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { FastifyReply } from 'fastify';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CreateRiceManageDto, UpdateRiceManageDto } from 'src/dto/rice.dto';
import { CreateStaffDto, CreateSurveyDto, UpdateStaffDto, UpdateSurveyNameDto } from 'src/dto/user.dto';
import { CreatePackingDto, UpdatePackingDto } from 'src/dto/packing.dto';
import { use } from 'passport';
import { CreateCompanyDto, UpdateCompanyDto } from 'src/dto/company.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

   @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @ApiOperation({ summary: 'Create Rice Manage Data' })
  @ApiResponse({ status: 201, description: 'Rice Manage created successfully' })
  @ApiBody({
    description: 'Rice Manage details',
    schema: {
      example: {
        riceNameEng: 'Jasmine Rice',
        riceNameThai: 'ข้าวหอม',
        riceCodeT: 'T001',
        riceCode1: 'C001',
        riceCode2: 'C002',
        riceType: 'White Rice'
      }
    }
  })
  @Post('createrice')
  createRice(
    @Body() dto: CreateRiceManageDto,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.createRice(dto, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @ApiOperation({ summary: 'Create Multiple Rice Manage Data' })
  @ApiResponse({ status: 201, description: 'Rice Manage records created successfully' })
  @ApiBody({
    description: 'Array of Rice Manage details',
    schema: {
      example: [
        {
          riceNameEng: 'Jasmine Rice',
          riceNameThai: 'ข้าวหอม',
          riceCodeT: 'T001',
          riceCode1: 'C001',
          riceCode2: 'C002',
          riceType: 'White Rice'
        }
      ]
    }
  })
  @Post('createricemany')
  createManyRice(
    @Body() dto: CreateRiceManageDto[],
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.createManyRice(dto, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all Rice Manage data' })
  @ApiResponse({ status: 200, description: 'Get all Rice Manage data complete' })
  @Get('getallrice')
  getAllRice(
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.getAllRice(request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Get Rice Manage data by ID' })
  @ApiResponse({ status: 200, description: 'Get Rice Manage data by ID complete' })
  @ApiQuery({ name: 'id', required: true, type: String, description: 'Rice Manage ID' })
  @Get('getbyriceid')
  getRiceById(
    @Query('id') id: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.getRiceById(id, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Update Rice Manage data' })
  @ApiResponse({ status: 200, description: 'Rice Manage updated successfully' })
  @ApiQuery({ name: 'id', required: true, type: String, description: 'Rice Manage ID' })
  @ApiBody({
    description: 'Rice Manage details',
    schema: {
      example: {
        riceNameEng: 'Jasmine Rice',
        riceNameThai: 'ข้าวหอม',
        riceCodeT: 'T001',
        riceCode1: 'C001',
        riceCode2: 'C002',
        riceType: 'White Rice'
      }
    }
  })
  @Put('updaterice')
  updateRice(
    @Query('id') id: string,
    @Body() dto: UpdateRiceManageDto,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.updateRice(id.trim(), dto, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete Rice Manage data' })
  @ApiResponse({ status: 200, description: 'Rice Manage deleted successfully' })
  @ApiQuery({ name: 'id', required: true, type: String, description: 'Rice Manage ID' })
  @Delete('deleterice')
  deleteRice(
    @Query('id') id: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.deleterice(id, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Search Rice Manage data' })
  @ApiResponse({ status: 200, description: 'Search Rice Manage data complete' })
  @ApiQuery({ name: 'riceNameEng', required: false, type: String, description: 'Rice Name English' })
  @ApiQuery({ name: 'riceNameThai', required: false, type: String, description: 'Rice Name Thai' })
  @ApiQuery({ name: 'riceType', required: false, type: String, description: 'Rice Type' })
  @Get('searchrice')
  searchRice(
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
    @Query('riceNameEng') riceNameEng?: string,
    @Query('riceNameThai') riceNameThai?: string,
    @Query('riceType') riceType?: string,

  ) {
    return this.adminService.searchrice(riceNameEng, riceNameThai, riceType, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @ApiOperation({ summary: 'Create Staff Data' })
  @ApiResponse({ status: 201, description: 'Staff created successfully' })
  @ApiBody({
    schema: {
      example: {
        staffNo: 'S001',
        staffName: 'John Doe',
        email: 'john@example.com',
        phone: '0812345678',
        position: 'Manager'
      }
    }
  })
  @Post('createstaff')
  createStaff(
    @Body() dto: CreateStaffDto,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.createStaff(dto, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all Staff data' })
  @ApiResponse({ status: 200, description: 'Get all Staff data complete' })
  @Get('getallstaff')
  getAllStaff(
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.getAllStaff(request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Get Staff data by ID' })
  @ApiQuery({ name: 'id', required: true, type: String })
  @Get('getstaffbyid')
  getStaffById(
    @Query('id') id: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.getStaffById(id, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Update Staff data' })
  @ApiQuery({ name: 'id', required: true, type: String })
  @Put('update')
  updateStaff(
    @Query('id') id: string,
    @Body() dto: UpdateStaffDto,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.updateStaff(id.trim(), dto, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete Staff data' })
  @ApiQuery({ name: 'id', required: true, type: String })
  @Delete('deletestaff')
  deleteStaff(
    @Query('id') id: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.deleteStaff(id, request, response);
  }


 

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Search Staff data' })
  @ApiResponse({ status: 200, description: 'Search Staff data complete' })
  @ApiQuery({ name: 'staffNo', required: false, type: Number, description: 'Staff Number' })
  @ApiQuery({ name: 'staffName', required: false, type: String, description: 'Staff Name' })
  @ApiQuery({ name: 'staffSurname', required: false, type: String, description: 'Staff Surname' })
  @Get('searchstaff')
  searchStaff(
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
    @Query('staffNo') staffNo?: number,
    @Query('staffName') staffName?: string,
    @Query('staffSurname') staffSurname?: string,

  ) {
    return this.adminService.searchStaff(staffNo, staffName, staffSurname, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Get Each Packing data' })
  @ApiQuery({ name: 'id', required: true, type: String })
  @Get('geteachpacking')
  getEachPacking(
    @Query('id') id: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.geteachpacking(id, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Add Packing Data' })
  @ApiResponse({ status: 200, description: 'Packing added successfully' })
  @ApiBody({
    schema: {
      example: {
        packingName: 'Bag',
        unit: 'kg'
      }
    }
  })
  @Post('addpacking')
  addpacking(
    @Body() dto: CreatePackingDto,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.addpacking(dto, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @Post('addpackingmany')
  @HttpCode(200)
  @ApiOperation({ summary: 'Add Multiple Packing Data' })
  @ApiResponse({ status: 200, description: 'Packing added successfully' })
  @ApiBody({
    schema: {
      example: [
        {
          packingName: 'Bag',
          unit: 'kg'
        }
      ]
    }
  })
  addManyPacking(
    @Body() dto: CreatePackingDto[],
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.addmanypacking(dto, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all Staff data' })
  @ApiResponse({ status: 200, description: 'Get all Staff data complete' })
  @Get('getallpacking')
  getalldata(
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.getallpackingdata(
      request, response
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get('searchpacking')
  @HttpCode(200)
  @ApiOperation({ summary: 'Search Packing data' })
  @ApiResponse({ status: 200, description: 'Search Packing data complete' })
  @ApiQuery({ name: 'packingName', required: false, type: String, description: 'Packing Name' })
  @ApiQuery({ name: 'unit', required: false, type: String, description: 'Unit' })
  searchPacking(
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
    @Query('packingName') packingName?: string,
    @Query('unit') unit?: string,) {
    return this.adminService.searchpacking(packingName, unit, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete Packing data' })
  @ApiQuery({ name: 'id', required: true, type: String })
  @Delete('deletepacking')
  deletePacking(
    @Query('id') id: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.deletePacking(id, request, response);
  }


    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOperation({ summary: 'Update Packing data' })
    @ApiQuery({ name: 'id', required: true, type: String })
    @ApiBody({
      schema: {
        example: {
          packingName: 'Bag',
          unit: 'kg'
        }
      }
    })
    @Put('updatepacking')
    updatePacking(
      @Query('id') id: string,
      @Body() dto: UpdatePackingDto,
      @Req() request: any,
      @Res({ passthrough: true }) response: FastifyReply
    ) {
      return this.adminService.updatepacking(id,dto, request, response);
    }
    
  
    

 @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOperation({ summary: 'Get Company data' })
    @ApiResponse({ status: 200, description: 'Get Company data complete' })
    @Get('getcompanydata')
    getCompany(
      @Req() request: any,
      @Res({ passthrough: true }) response: FastifyReply
    ) {
      return this.adminService.getCompany(request, response);
    }
  
  @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOperation({ summary: 'Post Company data' })
    @ApiResponse({ status: 200, description: 'Post Company data complete' })
    @Post('postcompanydata')
    postCompany(
      @Body() dto: CreateCompanyDto,
      @Req() request: any,
      @Res({ passthrough: true }) response: FastifyReply
    ) {

      return this.adminService.postCompany(dto, request, response);
    }  

  @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOperation({ summary: 'Delete Company data' })
    @ApiQuery({ name: 'id', required: true, type: String })
    @Delete('deletecompanydata')
    deleteCompany(
      @Query('id') id: string,
      @Req() request: any,
      @Res({ passthrough: true }) response: FastifyReply
    ) {
      return this.adminService.deleteCompany(id, request, response);
    }
  @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOperation({ summary: 'Update Company data' })
    @ApiQuery({ name: 'id', required: true, type: String })
    @ApiBody({
      schema: {
        example: {
          companyNameEN: 'Example Company',
          companyNameTH: 'บริษัทตัวอย่าง',
          companyDescription: 'Description of the company'
        }
      }
    })
    @Put('updatecompanydata')
    updateCompany(
      @Query('id') id: string,
      @Body() dto: UpdateCompanyDto,
      @Req() request: any,
      @Res({ passthrough: true }) response: FastifyReply
    ) {
      return this.adminService.updateCompany(id, dto, request, response);
    }
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOperation({ summary: 'Search Company data' })
    @Get('searchcompany')
    searchCompany(
      
      @Req() request: any,
      @Res({ passthrough: true }) response: FastifyReply,
      @Query('companyName') companyName: string,

    ) {
      return this.adminService.searchCompany(companyName, request, response);
    }
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOperation({ summary: 'Get each Company data' })
    @ApiQuery({ name: 'id', required: true, type: String })
    @Get('geteachcompany')
    getEachCompany(
      @Query('id') id: string,
      @Req() request: any,
      @Res({ passthrough: true }) response: FastifyReply
    ) {
      return this.adminService.getEachCompany(id, request, response);
    }



  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all SurveyName data' })
  @ApiResponse({ status: 200, description: 'Get all SurveyName data complete' })
  @Get('getallsurveyname')
  getAllSurveyName(
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
     @Query('page') page: string ,
  @Query('limit') limit: string ,
  ) {
    return this.adminService.getAllSurveyName(
    Number(page),
    Number(limit),
    request,
    response,
  );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Get each SurveyName data' })
  @ApiQuery({ name: 'id', required: true, type: String })
  @Get('geteachsurveyname')
  getEachSurveyName(
    @Query('id') id: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.getEachSurveyName(id, request, response);
  }
  
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Add SurveyName data' })
  @ApiResponse({ status: 200, description: 'Add SurveyName data complete' })
  @ApiBody({
    schema: {
      example: {
        amphoes: 'Amphoe Example',
        changwat: 'Changwat Example',
        surveyNameEN: 'Survey Name EN',
        surveyNameTH: 'Survey Name TH'
      }
    }
  })
  @Post('postsurveyname')
  addSurveyName(
    @Body() dto: CreateSurveyDto,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.addSurveyName(dto, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete SurveyName data' })
  @ApiQuery({ name: 'id', required: true, type: String })
  @Delete('deletesurveydata')
  deleteSurveyName(
    @Query('id') id: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.deleteSurveyName(id, request, response);
  }             
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Update SurveyName data' })  
  @ApiQuery({ name: 'id', required: true, type: String })
  @ApiBody({
    schema: {
      example: {
        amphoes: 'Amphoe Example',
        changwat: 'Changwat Example',
        surveyNameEN: 'Survey Name EN',
        surveyNameTH: 'Survey Name TH'
      }
    }
  })
  @Put('updatesurveyname')
  updateSurveyName(
    @Query('id') id: string,
    @Body() dto: UpdateSurveyNameDto,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    return this.adminService.updateSurveyName(id, dto, request, response);

}

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Search SurveyName data' })
  @ApiResponse({ status: 200, description: 'Search SurveyName data complete' })
  @ApiQuery({ name: 'changwat', required: false, type: String, description: 'Changwat' })
  @ApiQuery({ name: 'amphoe', required: false, type: String, description: 'Amphoe' })
  @ApiQuery({ name: 'tambon', required: false, type: String, description: 'Tambon' })
  @Get('searchsurveyname')
  searchSurveyName(
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
    @Query('changwat') changwat?: string,
    @Query('amphoe') amphoe?: string,
    @Query('tambon') tambon?: string,
  ) {
    return this.adminService.searchSurveyName(changwat, amphoe, tambon, request, response);
  }
  
}

 
