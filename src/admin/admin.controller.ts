import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCompanyDto, UpdateCompanyDto } from 'src/dto/company.dto';
import { CreateGoDownGroupDto, UpdateGoDownGroupDto } from 'src/dto/goDownGroup.dto';
import { CreatePackingDto, UpdatePackingDto } from 'src/dto/packing.dto';
import { CreateRiceManageDto, UpdateRiceManageDto } from 'src/dto/rice.dto';
import { CreateStaffDto, CreateSurveyDto, UpdateStaffDto, UpdateSurveyNameDto } from 'src/dto/user.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { AdminService } from './admin.service';

const RICE_EXAMPLE = {
  riceNameEng: 'Jasmine Rice',
  riceNameThai: 'ข้าวหอม',
  riceCodeT: 'T001',
  riceCode1: 'C001',
  riceCode2: 'C002',
  riceType: 'White Rice',
};
const STAFF_EXAMPLE = {
  staffName: 'John Doe',
  email: 'john@example.com',
  phone: '0812345678',
  position: 'Manager',
};
const PACKING_EXAMPLE = { packingName: 'Bag', unit: 'kg' };
const COMPANY_EXAMPLE = {
  companyNameEN: 'Example Company',
  companyNameTH: 'บริษัทตัวอย่าง',
  companyDescription: 'Description of the company',
};
const SURVEY_NAME_EXAMPLE = {
  amphoes: 'Amphoe Example',
  changwat: 'Changwat Example',
  surveyNameEN: 'Survey Name EN',
  surveyNameTH: 'Survey Name TH',
};
const GODOWN_GROUP_EXAMPLE = { goDownGroupName: 'Group A', goDownColor: '#FF5733' };

const ID_QUERY = { name: 'id', required: true, type: String } as const;

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Rice ───────────────────────────────────────────────────────────────────

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create rice' })
  @ApiBody({ type: CreateRiceManageDto, examples: { example1: { value: RICE_EXAMPLE } } })
  @ApiResponse({ status: 201, description: 'Created rice data complete' })
  @Post('createrice')
  createRice(@Body() dto: CreateRiceManageDto) {
    return this.adminService.createRice(dto);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple rice (duplicates skipped)' })
  @ApiBody({ type: [CreateRiceManageDto], examples: { example1: { value: [RICE_EXAMPLE] } } })
  @ApiResponse({ status: 201, description: 'Created rice data complete' })
  @Post('createricemany')
  createManyRice(@Body() dtoList: CreateRiceManageDto[]) {
    return this.adminService.createManyRice(dtoList);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all rice (sorted by English name)' })
  @ApiResponse({ status: 200, description: 'Rice list' })
  @Get('getallrice')
  getAllRice() {
    return this.adminService.getAllRice();
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get rice by ID' })
  @ApiQuery({ ...ID_QUERY, description: 'riceManageID' })
  @ApiResponse({ status: 200, description: 'Rice' })
  @ApiResponse({ status: 404, description: 'Rice not found' })
  @Get('getbyriceid')
  getRiceById(@Query('id') id: string) {
    return this.adminService.getRiceById(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update rice' })
  @ApiQuery({ ...ID_QUERY, description: 'riceManageID' })
  @ApiBody({ type: UpdateRiceManageDto, examples: { example1: { value: RICE_EXAMPLE } } })
  @ApiResponse({ status: 200, description: 'Updated rice' })
  @ApiResponse({ status: 404, description: 'Rice not found' })
  @Put('updaterice')
  updateRice(@Query('id') id: string, @Body() dto: UpdateRiceManageDto) {
    return this.adminService.updateRice(id.trim(), dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete rice' })
  @ApiQuery({ ...ID_QUERY, description: 'riceManageID' })
  @ApiResponse({ status: 200, description: 'Rice deleted successfully' })
  @ApiResponse({ status: 404, description: 'Rice not found' })
  @Delete('deleterice')
  deleteRice(@Query('id') id: string) {
    return this.adminService.deleteRice(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search rice — matches ANY given field (partial, case-insensitive)' })
  @ApiQuery({ name: 'riceNameEng', required: false, type: String })
  @ApiQuery({ name: 'riceNameThai', required: false, type: String })
  @ApiQuery({ name: 'riceType', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Matching rice list' })
  @Get('searchrice')
  searchRice(
    @Query('riceNameEng') riceNameEng?: string,
    @Query('riceNameThai') riceNameThai?: string,
    @Query('riceType') riceType?: string,
  ) {
    return this.adminService.searchRice(riceNameEng, riceNameThai, riceType);
  }

  // ─── Staff ──────────────────────────────────────────────────────────────────

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create staff (staffNo is assigned automatically)' })
  @ApiBody({ type: CreateStaffDto, examples: { example1: { value: STAFF_EXAMPLE } } })
  @ApiResponse({ status: 201, description: 'Created staff' })
  @Post('createstaff')
  createStaff(@Body() dto: CreateStaffDto) {
    return this.adminService.createStaff(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all staff (sorted by staffNo)' })
  @ApiResponse({ status: 200, description: 'Staff list' })
  @Get('getallstaff')
  getAllStaff() {
    return this.adminService.getAllStaff();
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get staff by ID' })
  @ApiQuery({ ...ID_QUERY, description: 'staffID' })
  @ApiResponse({ status: 200, description: 'Staff' })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  @Get('getstaffbyid')
  getStaffById(@Query('id') id: string) {
    return this.adminService.getStaffById(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update staff' })
  @ApiQuery({ ...ID_QUERY, description: 'staffID' })
  @ApiBody({ type: UpdateStaffDto })
  @ApiResponse({ status: 200, description: 'Updated staff' })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  @Put('update')
  updateStaff(@Query('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.adminService.updateStaff(id.trim(), dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete staff' })
  @ApiQuery({ ...ID_QUERY, description: 'staffID' })
  @ApiResponse({ status: 200, description: 'Staff deleted successfully' })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  @Delete('deletestaff')
  deleteStaff(@Query('id') id: string) {
    return this.adminService.deleteStaff(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search staff by staffNo (exact) and/or name words (partial)' })
  @ApiQuery({ name: 'staffNo', required: false, type: Number })
  @ApiQuery({ name: 'staffName', required: false, type: String })
  @ApiQuery({ name: 'staffSurname', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Search staff success' })
  @Get('searchstaff')
  searchStaff(
    @Query('staffNo') staffNo?: string,
    @Query('staffName') staffName?: string,
    @Query('staffSurname') staffSurname?: string,
  ) {
    return this.adminService.searchStaff(staffNo, staffName, staffSurname);
  }

  // ─── Packing ────────────────────────────────────────────────────────────────

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create packing' })
  @ApiBody({ type: CreatePackingDto, examples: { example1: { value: PACKING_EXAMPLE } } })
  @ApiResponse({ status: 201, description: 'Created packing data complete' })
  @Post('addpacking')
  createPacking(@Body() dto: CreatePackingDto) {
    return this.adminService.createPacking(dto);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple packing (duplicates skipped)' })
  @ApiBody({ type: [CreatePackingDto], examples: { example1: { value: [PACKING_EXAMPLE] } } })
  @ApiResponse({ status: 201, description: 'Created packing data complete' })
  @Post('addpackingmany')
  createManyPacking(@Body() dtoList: CreatePackingDto[]) {
    return this.adminService.createManyPacking(dtoList);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all packing' })
  @ApiResponse({ status: 200, description: 'Get all packing data complete' })
  @Get('getallpacking')
  getAllPacking() {
    return this.adminService.getAllPacking();
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get packing by ID' })
  @ApiQuery({ ...ID_QUERY, description: 'packingID' })
  @ApiResponse({ status: 200, description: 'Get packing data complete' })
  @ApiResponse({ status: 404, description: 'Packing not found' })
  @Get('geteachpacking')
  getPackingById(@Query('id') id: string) {
    return this.adminService.getPackingById(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update packing' })
  @ApiQuery({ ...ID_QUERY, description: 'packingID' })
  @ApiBody({ type: UpdatePackingDto, examples: { example1: { value: PACKING_EXAMPLE } } })
  @ApiResponse({ status: 200, description: 'Updated packing data complete' })
  @ApiResponse({ status: 404, description: 'Packing not found' })
  @Put('updatepacking')
  updatePacking(@Query('id') id: string, @Body() dto: UpdatePackingDto) {
    return this.adminService.updatePacking(id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete packing' })
  @ApiQuery({ ...ID_QUERY, description: 'packingID' })
  @ApiResponse({ status: 200, description: 'Packing deleted successfully' })
  @ApiResponse({ status: 404, description: 'Packing not found' })
  @Delete('deletepacking')
  deletePacking(@Query('id') id: string) {
    return this.adminService.deletePacking(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search packing — matches ALL given fields (partial, case-insensitive)' })
  @ApiQuery({ name: 'packingName', required: false, type: String })
  @ApiQuery({ name: 'unit', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Search packing success' })
  @Get('searchpacking')
  searchPacking(@Query('packingName') packingName?: string, @Query('unit') unit?: string) {
    return this.adminService.searchPacking(packingName, unit);
  }

  // ─── Company ────────────────────────────────────────────────────────────────

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'Get company data complete' })
  @Get('getcompanydata')
  getAllCompanies() {
    return this.adminService.getAllCompanies();
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiQuery({ ...ID_QUERY, description: 'companyID' })
  @ApiResponse({ status: 200, description: 'Get company data complete' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @Get('geteachcompany')
  getCompanyById(@Query('id') id: string) {
    return this.adminService.getCompanyById(id);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create company' })
  @ApiBody({ type: CreateCompanyDto, examples: { example1: { value: COMPANY_EXAMPLE } } })
  @ApiResponse({ status: 201, description: 'Created company data complete' })
  @Post('postcompanydata')
  createCompany(@Body() dto: CreateCompanyDto) {
    return this.adminService.createCompany(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update company' })
  @ApiQuery({ ...ID_QUERY, description: 'companyID' })
  @ApiBody({ type: UpdateCompanyDto, examples: { example1: { value: COMPANY_EXAMPLE } } })
  @ApiResponse({ status: 200, description: 'Updated company data complete' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @Put('updatecompanydata')
  updateCompany(@Query('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.adminService.updateCompany(id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete company' })
  @ApiQuery({ ...ID_QUERY, description: 'companyID' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @Delete('deletecompanydata')
  deleteCompany(@Query('id') id: string) {
    return this.adminService.deleteCompany(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search companies by Thai or English name (partial)' })
  @ApiQuery({ name: 'companyName', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Search company success' })
  @Get('searchcompany')
  searchCompanies(@Query('companyName') companyName?: string) {
    return this.adminService.searchCompanies(companyName);
  }

  // ─── SurveyName ─────────────────────────────────────────────────────────────

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get survey names (paginated, sorted by changwat)' })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Survey names + pagination' })
  @ApiResponse({ status: 400, description: 'page / limit must be a positive integer' })
  @Get('getallsurveyname')
  getAllSurveyNames(@Query('page') page: string, @Query('limit') limit: string) {
    return this.adminService.getAllSurveyNames(page, limit);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get survey name by ID' })
  @ApiQuery({ ...ID_QUERY, description: 'surveyNameID' })
  @ApiResponse({ status: 200, description: 'Get survey name data complete' })
  @ApiResponse({ status: 404, description: 'Survey name not found' })
  @Get('geteachsurveyname')
  getSurveyNameById(@Query('id') id: string) {
    return this.adminService.getSurveyNameById(id);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create survey name' })
  @ApiBody({ type: CreateSurveyDto, examples: { example1: { value: SURVEY_NAME_EXAMPLE } } })
  @ApiResponse({ status: 201, description: 'Created survey name data complete' })
  @Post('postsurveyname')
  createSurveyName(@Body() dto: CreateSurveyDto) {
    return this.adminService.createSurveyName(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update survey name' })
  @ApiQuery({ ...ID_QUERY, description: 'surveyNameID' })
  @ApiBody({ type: UpdateSurveyNameDto, examples: { example1: { value: SURVEY_NAME_EXAMPLE } } })
  @ApiResponse({ status: 200, description: 'Updated survey name data complete' })
  @ApiResponse({ status: 404, description: 'Survey name not found' })
  @Put('updatesurveyname')
  updateSurveyName(@Query('id') id: string, @Body() dto: UpdateSurveyNameDto) {
    return this.adminService.updateSurveyName(id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete survey name' })
  @ApiQuery({ ...ID_QUERY, description: 'surveyNameID' })
  @ApiResponse({ status: 200, description: 'Survey name deleted successfully' })
  @ApiResponse({ status: 404, description: 'Survey name not found' })
  @Delete('deletesurveydata')
  deleteSurveyName(@Query('id') id: string) {
    return this.adminService.deleteSurveyName(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search survey names — matches ALL given fields (partial, case-insensitive)' })
  @ApiQuery({ name: 'changwat', required: false, type: String, description: 'จังหวัด' })
  @ApiQuery({ name: 'amphoe', required: false, type: String, description: 'อำเภอ' })
  @ApiResponse({ status: 200, description: 'Search survey name success' })
  @Get('searchsurveyname')
  searchSurveyNames(@Query('changwat') changwat?: string, @Query('amphoe') amphoe?: string) {
    return this.adminService.searchSurveyNames(changwat, amphoe);
  }

  // ─── GoDownGroup ────────────────────────────────────────────────────────────

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all go-down groups' })
  @ApiResponse({ status: 200, description: 'Get all goDownGroup data complete' })
  @Get('getallgodowngroup')
  getAllGoDownGroups() {
    return this.adminService.getAllGoDownGroups();
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get go-down group by ID (with its survey names)' })
  @ApiQuery({ ...ID_QUERY, description: 'goDownGroupID' })
  @ApiResponse({ status: 200, description: 'Get goDownGroup data complete' })
  @ApiResponse({ status: 404, description: 'GoDownGroup not found' })
  @Get('geteachgodowngroup')
  getGoDownGroupById(@Query('id') id: string) {
    return this.adminService.getGoDownGroupById(id);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create go-down group' })
  @ApiBody({ type: CreateGoDownGroupDto, examples: { example1: { value: GODOWN_GROUP_EXAMPLE } } })
  @ApiResponse({ status: 201, description: 'Created goDownGroup data complete' })
  @Post('creategodowngroup')
  createGoDownGroup(@Body() dto: CreateGoDownGroupDto) {
    return this.adminService.createGoDownGroup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update go-down group' })
  @ApiQuery({ ...ID_QUERY, description: 'goDownGroupID' })
  @ApiBody({ type: UpdateGoDownGroupDto, examples: { example1: { value: GODOWN_GROUP_EXAMPLE } } })
  @ApiResponse({ status: 200, description: 'Updated goDownGroup data complete' })
  @ApiResponse({ status: 404, description: 'GoDownGroup not found' })
  @Put('updategodowngroup')
  updateGoDownGroup(@Query('id') id: string, @Body() dto: UpdateGoDownGroupDto) {
    return this.adminService.updateGoDownGroup(id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete go-down group' })
  @ApiQuery({ ...ID_QUERY, description: 'goDownGroupID' })
  @ApiResponse({ status: 200, description: 'GoDownGroup deleted successfully' })
  @ApiResponse({ status: 404, description: 'GoDownGroup not found' })
  @Delete('deletegodowngroup')
  deleteGoDownGroup(@Query('id') id: string) {
    return this.adminService.deleteGoDownGroup(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search go-down groups by name (partial, case-insensitive)' })
  @ApiQuery({ name: 'goDownGroupName', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Search goDownGroup success' })
  @Get('searchgodowngroup')
  searchGoDownGroups(@Query('goDownGroupName') goDownGroupName?: string) {
    return this.adminService.searchGoDownGroups(goDownGroupName);
  }
}
