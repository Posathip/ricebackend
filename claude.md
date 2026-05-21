# Backend Refactoring Instructions

## Goal
Refactor service functions across all service files. Do NOT change behavior — only improve structure, safety, and readability.

## Stack
- NestJS + TypeScript

## Rules for Every Service Function

### 1. Guards
- Check every controller method — if missing @UseGuards(JwtAuthGuard) ให้เพิ่มทันที
- Example:
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: string) { ... }

### 2. Exception Handling
- Wrap all async operations in try/catch
- Use NestJS built-in exceptions, NOT plain Error
- Example:
  try {
    ...
  } catch (error) {
    console.error('[UserService.getUserById]', error)
    throw new InternalServerErrorException(error.message)
  }
- Common exceptions to use:
  - NotFoundException               → ไม่เจอ resource
  - BadRequestException             → input ไม่ถูกต้อง
  - UnauthorizedException           → ไม่มีสิทธิ์
  - ForbiddenException              → ห้ามเข้าถึง
  - InternalServerErrorException    → error อื่นๆ

### 3. Console Logs
- Add console.log at the START of every function with its name and key input params
- Add console.log at the END before returning with result summary
- Example:
  console.log('[UserService.getUserById] userId:', userId)
  console.log('[UserService.getUserById] result:', result?.id ?? 'not found')

### 4. Complexity Reduction
- If a function is longer than 30 lines or nested more than 2 levels deep → split into smaller private helper functions
- Each function should do ONE thing only
- Extract repeated logic into a separate private helper

### 5. DTO Validation (เพิ่มเติม)
- Every controller method that accepts body must use a DTO class with class-validator
- Never accept plain object or `any` as input
- Example:
  async createUser(@Body() dto: CreateUserDto) { ... }
- DTO must have validation decorators:
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @IsOptional()

### 6. Return Type (เพิ่มเติม)
- Every service function MUST have explicit return type, never implicit or `any`
- Example:
  async getUserById(id: string): Promise<User>
  async getUsers(): Promise<User[]>
  async deleteUser(id: string): Promise<void>

### 7. Null/Undefined Check (เพิ่มเติม)
- After every DB query — check if result is null before using it
- Example:
  const user = await this.userRepository.findOne(id)
  if (!user) throw new NotFoundException(`User ${id} not found`)

### 8. Async/Await Consistency (เพิ่มเติม)
- NEVER mix .then().catch() with async/await in the same function
- Always use async/await throughout

### 9. Magic Numbers & Strings (เพิ่มเติม)
- No hardcoded magic values inline — extract to a named const
- Example:
  const MAX_LOGIN_ATTEMPTS = 5   ✅
  if (attempts > 5) ...          ❌

## Workflow
- YOU MUST process one service file at a time
- After each file run tests to confirm no behavior change
- IMPORTANT: Do not modify route files, controllers, or models — service files only