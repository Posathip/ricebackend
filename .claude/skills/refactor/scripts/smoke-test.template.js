// Smoke test template: boots the real AppModule (from `npm run build` output) with PrismaService
// replaced by an in-memory mock, then calls endpoints through Fastify inject.
// Copy to the scratchpad, add checks for the routes you changed, run from the project root:
//   npm run build && node /path/to/smoke-test.js
// Never point this at a real database.
process.env.JWT_ACCESS_SECRET = 'smoke-secret';
const path = require('path');
const root = process.cwd();
const req = (m) => require(path.join(root, 'node_modules', m));
const { Test } = req('@nestjs/testing');
const { FastifyAdapter } = req('@nestjs/platform-fastify');
const { ValidationPipe } = req('@nestjs/common');
const jwt = req('jsonwebtoken');
const { AppModule } = require(path.join(root, 'dist/src/app.module'));
const { PrismaService } = require(path.join(root, 'dist/prisma/prisma.service'));

// ── Prisma mock ──────────────────────────────────────────────────────────────
// Every call is recorded in `calls`. Set `handlers['model.op']` to a value or (args) => value.
const calls = [];
const handlers = {};
function model(name) {
  return new Proxy({}, {
    get: (_, op) => async (args) => {
      calls.push({ model: name, op, args });
      const handler = handlers[`${name}.${op}`];
      if (handler !== undefined) return typeof handler === 'function' ? handler(args) : handler;
      if (['findMany', 'groupBy', 'createManyAndReturn'].includes(op)) return [];
      if (op === 'count') return 0;
      if (['createMany', 'updateMany', 'deleteMany'].includes(op)) return { count: 0 };
      return null;
    },
  });
}
const prismaMock = new Proxy({
  $connect: async () => {}, $disconnect: async () => {}, onModuleInit: async () => {}, onModuleDestroy: async () => {},
  $transaction: async (arg) => (typeof arg === 'function' ? arg(prismaMock) : Promise.all(arg)),
}, { get: (target, prop) => (prop in target ? target[prop] : (target[prop] = model(prop))) });

let failures = 0;
function check(name, condition, details) {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${condition ? '' : '  -> ' + JSON.stringify(details)}`);
  if (!condition) failures++;
}
function reset() {
  calls.length = 0;
  for (const key of Object.keys(handlers)) delete handlers[key];
}

(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService).useValue(prismaMock).compile();
  const app = moduleRef.createNestApplication(new FastifyAdapter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true })); // same as main.ts
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  const token = jwt.sign({ id: 'u1', email: 'smoke@example.com' }, 'smoke-secret');
  const call = (method, url, payload, withToken = true) =>
    app.inject({ method, url, payload, headers: withToken ? { authorization: `Bearer ${token}` } : {} });

  // ── Checks (examples — replace/add for the routes you changed) ──────────────
  let res = await call('GET', '/staff/getdata', undefined, false);
  check('guard: no token -> 401', res.statusCode === 401, res.statusCode);

  reset();
  res = await call('GET', '/staff/getdata');
  check('empty staff -> 404 + message', res.statusCode === 404 && res.json().message === 'Staff not found', [res.statusCode, res.body]);

  reset();
  handlers['riceManage.findMany'] = [{ riceManageID: 'r1', riceNameEng: 'Jasmine' }];
  res = await call('GET', '/admin/getallrice');
  check('getallrice -> 200 array', res.statusCode === 200 && res.json()[0].riceManageID === 'r1', [res.statusCode, res.body]);
  check('getallrice -> exactly 1 query', calls.length === 1, calls.map((c) => `${c.model}.${c.op}`));

  await app.close();
  console.log(failures === 0 ? '\nALL PASSED' : `\n${failures} FAILED`);
  process.exit(failures ? 1 : 0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
