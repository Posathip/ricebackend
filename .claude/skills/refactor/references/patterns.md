# Before / after patterns (from this codebase)

## 1. response.send → return + exception + @HttpCode

Before
```ts
async getRiceById(id: string, request: any, response: any): Promise<void> {
  try {
    const rice = await this.prisma.riceManage.findUnique({ where: { riceManageID: id } });
    if (!rice) return response.status(404).send({ message: 'Rice not found' });
    return response.status(200).send(rice);
  } catch (error) {
    return response.status(500).send({ message: 'Internal server error' });
  }
}
```
After
```ts
async getRiceById(id: string): Promise<riceManage> {
  console.log('[AdminService.getRiceById] id:', id);
  try {
    const rice = await this.findRiceOrThrow(id);
    console.log('[AdminService.getRiceById] result:', rice.riceManageID);
    return rice;
  } catch (error) {
    rethrowAsHttpException('AdminService.getRiceById', error);
  }
}
```
Controller: `@HttpCode(HttpStatus.OK) @Get('getbyriceid') getRiceById(@Query('id') id: string) { return this.adminService.getRiceById(id); }`

## 2. N+1 loop → one query + Map

Before
```ts
certificates.map(async (item) => {
  const company = await this.prisma.company.findFirst({ where: { companyNameTH: item.companyName } });
  ...
});
```
After
```ts
const companies = await this.prisma.company.findMany({
  where: { companyNameTH: { in: [...new Set(names)] } },
  select: { companyNameTH: true, companyNameEN: true },
});
const companyNameEnByTh = firstMatchMap(companies.map((c) => [c.companyNameTH, c.companyNameEN]));
certificates.map((item) => companyNameEnByTh.get(item.companyName ?? '') ...);
```

"Latest job per request" (one query per row) → `groupBy({ by: ['requestID'], where: { requestID: { in: ids } }, _max: { jobID: true } })`.

## 3. Validation helpers that "return" an error don't stop the caller

Before (bug: update still ran, response sent twice)
```ts
await this.validateNoDuplicateCertNo(id, dto, response); // does response.status(400).send(...)
await this.prisma.certificatesheet.update(...);
```
After
```ts
for (const field of UNIQUE_NUMBER_FIELDS) {
  if (dto[field] === undefined) continue;
  const duplicate = await this.prisma.certificatesheet.findFirst({ where: { [field]: dto[field], NOT: { certificateSheetID: id } } });
  if (duplicate) throw new BadRequestException(`${field} already exists`);
}
```

## 4. Multi-step writes → transaction

```ts
const updated = await this.prisma.$transaction(async (tx) => {
  const checkWeight = await tx.validate_Check_Weight.findUnique({ ... });
  if (!checkWeight) throw new NotFoundException('Check weight data not found');
  const newRemain = this.calculateNewRemain(...);          // throws BadRequest → rollback
  const row = await tx.validate_Check_Weight.update({ ... });
  await tx.bufferRemain.update({ ... });
  await this.syncCertificateSheet(tx, checkWeight, row);
  return row;
});
```

## 5. Typed Prisma select

```ts
const STAFF_SELECT = { staffID: true, staffNo: true, staffName: true } satisfies Prisma.staffSelect;
export type StaffSummary = Prisma.staffGetPayload<{ select: typeof STAFF_SELECT }>;
```

## 6. Query params are strings

```ts
// @Query('jobno') jobNo: number  ← lie; it's "5" at runtime and Prisma rejects it for Int
const jobID = parseInt(jobNo, DECIMAL_RADIX);
if (isNaN(jobID)) throw new BadRequestException(`Invalid jobno: ${jobNo}`);
```

## 7. xml2js single element

With `explicitArray: false`, one `<LicenseHeader>` comes back as an object, not an array → normalise with `toArray(value)` before looping.

## 8. Things that looked fine but were bugs here

- `findFirst({ where: { companyNameTH: name ?? undefined } })` — `undefined` removes the filter and returns an arbitrary row.
- Hard-coded `${year}-${month}-31` → Invalid Date for 30-day months.
- `createMany` with the same `staffNo` for every row on a `@unique` column.
- Storing plaintext into a `@unique` password column shared by all new users.
