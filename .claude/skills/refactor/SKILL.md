---
name: refactor
description: Refactor or write NestJS + Prisma code in this rice-ERP backend (สภาข้าว) the house way — clean naming, no N+1 loops, NestJS exceptions, transactions, typed Prisma selects, accurate Swagger, verified with build + mocked-Prisma smoke test. Use when the user asks to refactor, clean up, rename, optimize, fix a service/controller, or add a new endpoint/module.
---

# Refactor / write NestJS code (ricebackend)

Goal: make the code smaller, clearer and safer **without breaking the frontend**. Fix real bugs you find, and report them.

## 0. Before touching code

1. Read the whole service **and** its controller, the DTOs it uses, and the Prisma models involved (`prisma/schema.prisma`). Field names in the schema are the truth — the old code often uses names that don't exist (e.g. `amphoe` vs `amphoes`, `requestID` vs `requestId`).
2. Note what the frontend sees for every route: **URL path, status code, success body shape**. These must not change.
3. Work **one module at a time**: service → controller → `npx tsc --noEmit -p tsconfig.json` → next module.

## 1. Contract that must NOT change

- Route paths (`@Get('getallrice')` stays even if the method becomes `getAllRice`).
- Success response body keys, including Thai keys and their typos (`'ผู้ได้รับอนุญาติส่งออก'`, `'คำสั่งจ่างงานที่'`) — Excel/frontend read them.
- Success status codes. When removing `response.status(X).send()`, put `@HttpCode(X)` on the controller method. Remember POST defaults to 201 in Nest — the old service often sent 200.

## 2. Service rules

- Services **return data**; never take `request`/`response` params (except where cookies are genuinely needed).
- Errors: throw NestJS exceptions (`NotFoundException`, `BadRequestException`, …). Every public method:
  ```ts
  async getRiceById(id: string): Promise<riceManage> {
    console.log('[AdminService.getRiceById] id:', id);
    try {
      const rice = await this.findRiceOrThrow(id);
      console.log('[AdminService.getRiceById] result:', rice.riceManageID);
      return rice;
    } catch (error) {
      rethrowAsHttpException('AdminService.getRiceById', error); // src/common/service-error.ts
    }
  }
  ```
- To keep an old error body that had extra keys, pass an object: `throw new NotFoundException({ success: false, message: '...', finalNo })`.
- Explicit return types, no `any`. Type Prisma results with a `const X_SELECT = {...} satisfies Prisma.<model>Select` + `Prisma.<model>GetPayload<{ select: typeof X_SELECT }>`.
- Null-check every `findUnique`/`findFirst` before use; put repeated checks in `private findXOrThrow(id)`.
- Methods > ~30 lines or nested > 2 levels → split into private helpers that each do one thing.
- Magic values → named `const` at the top of the file.
- Remove: commented-out code, unused injections (`JwtService` is only used by auth), unused imports, `[x: string]: any` (it hides calls to methods that don't exist).

## 3. Performance & data safety

- **No `await prisma` inside a loop.** Collect keys → one `findMany({ where: { key: { in: keys } } })` → `Map` lookup. Use `groupBy` + `_max` instead of "latest per row" queries; `createManyAndReturn` instead of N creates.
- `Array.find` inside `.map` → build a `Map` first (keep first match if the old code used `find`/`findFirst`).
- Independent queries → `Promise.all`.
- Several writes that must succeed together → `prisma.$transaction` (array form, or interactive `async (tx) => ...` when later writes depend on earlier reads; raise `timeout` for bulk work).
- Query params are **strings** at runtime even if typed `number` — parse them (`parseInt`, `Number`) and throw `BadRequestException` when invalid. Prisma rejects strings for Int columns.
- Dates: build month ranges with `new Date(y, m, 0)` (last day), never hard-code day 31.

## 4. Naming

- camelCase verbs that say what happens: `getRequestsByDate`, `createManyStaff`, `exportCertificatesByMonth`, `findCompanyNameEn`.
- Collections are plural (`certificates`), maps say key→value (`companyNameEnByTh`), booleans read as questions (`isFirstUpdate`).
- No `data`, `result2`, `getdata`, `finddata`, `querydata` for new names (keep them only where they are part of the response contract).

## 5. Controller & Swagger

- Every route has `@UseGuards(JwtAuthGuard)` (or class-level) — only `POST /auth/login` is public.
- Body always a DTO class with class-validator decorators; never `request.body` or `any`. Nested arrays need `@ValidateNested({ each: true })` + `@Type(() => ChildDto)`.
- Swagger must describe reality: `@ApiTags`, `@ApiBearerAuth`, `@ApiOperation` summary, `@ApiQuery` for every query param, `@ApiResponse` for each status the service can return, examples that match the real response shape. Prefer `@ApiProperty({ example })` on DTO fields over inline example objects.

## 6. Verify (required before saying "done")

1. `npx tsc --noEmit -p tsconfig.json`
2. `npm run build && npm test`
3. Smoke test against the built app with Prisma mocked — copy `scripts/smoke-test.template.js` from this skill into the scratchpad, add checks for the routes you changed, run `node <path>` from the project root. Do **not** run it against a real database.
4. Report honestly: what passed, what was only tested with mocks, and every behaviour change the frontend may notice (status codes, error body shape, new guards, removed routes).

See `references/patterns.md` for before/after examples taken from this codebase.
