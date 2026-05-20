# Rice Export Backend API

Backend API สำหรับระบบตรวจสอบน้ำหนักและติดตามใบอนุญาตส่งออกข้าว พัฒนาด้วย NestJS + Fastify + Prisma + PostgreSQL และ Deploy ด้วย Docker

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS (Fastify adapter) |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT |
| Docs | Swagger (OpenAPI) |
| Deploy | Docker + GitHub Actions |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL
- Docker (for production)

### Install Dependencies

```bash
npm install
```

### Environment Variables

สร้างไฟล์ `.env` ที่ root โปรเจกต์:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ricedb
JWT_SECRET=your_jwt_secret
```

### Database Migration

```bash
npx prisma migrate dev
npx prisma generate
```

### Run (Development)

```bash
# watch mode
npm run start:dev

# normal
npm run start
```

### Run (Production)

```bash
docker compose up -d --build
```

---

## API Endpoints

Swagger UI พร้อมใช้งานที่ `http://localhost:4000/api`

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login รับ JWT token |

### Trade

| Method | Path | Description |
|--------|------|-------------|
| POST | `/trade/getdata` | ดึงข้อมูลใบอนุญาตจากระบบรัฐ (SOAP) |
| GET | `/trade/licensequery` | ค้นหาใบอนุญาตตามเลขที่ |
| POST | `/trade/createrequest` | สร้างคำขอแจ้งขอตรวจสอบ |
| PUT | `/trade/updaterequest` | แก้ไขคำขอตรวจสอบ |
| DELETE | `/trade/deleteorder` | ลบคำขอตรวจสอบ |
| DELETE | `/trade/deletedescription` | ลบรายละเอียดย่อยของคำขอ |
| GET | `/trade/getrequest` | ดึงคำขอตรวจสอบตาม ID |
| GET | `/trade/getrequestbydate` | ดึงคำขอตรวจสอบตามวันที่ |
| GET | `/trade/inspectplace` | ดึงรายชื่อสถานที่ตรวจสอบ |
| GET | `/trade/province` | ดึงรายชื่อจังหวัด |
| GET | `/trade/getlicensebydate` | ดึงใบอนุญาตตามช่วงวันที่ |
| POST | `/trade/postsurvey` | บันทึกข้อมูล Survey |

### Record Notification (Check Weight)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/recordnotification/postdata` | บันทึกข้อมูลการตรวจสอบน้ำหนัก |
| GET | `/recordnotification/getallcheckweightdata` | ดึงข้อมูลการตรวจสอบน้ำหนักทั้งหมด |
| GET | `/recordnotification/getcheckweightdata` | ดึงข้อมูลตาม Check Weight ID |
| GET | `/recordnotification/getcheckweightdatafilterbydate` | กรองข้อมูลตามวันที่ |
| GET | `/recordnotification/getcheckweightdatafilterbyjobnoandlicenseid` | กรองตาม Job No และ License ID |
| PUT | `/recordnotification/updatecheckweightdata` | อัปเดตข้อมูลการตรวจสอบน้ำหนัก |
| GET | `/recordnotification/licensehistory` | ดึงประวัติการใช้ใบอนุญาต จัดกลุ่มตาม licenseDetailID พร้อม remainNetWeightKGM |

### Certificate

| Method | Path | Description |
|--------|------|-------------|
| GET | `/certificate/...` | ดึงข้อมูล Certificate |

### Admin / User / Company / Statistic

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/admin/...` | จัดการข้อมูล Admin |
| GET/POST | `/user/...` | จัดการข้อมูลผู้ใช้ |
| GET/POST | `/company/...` | จัดการข้อมูลบริษัท |
| GET | `/statistic/...` | สถิติและรายงาน |

---

## Database Schema (Key Tables)

```
DataFromGoverment   — ข้อมูลใบอนุญาตจากระบบรัฐ
LicenseDetail       — รายละเอียดรายการใน ใบอนุญาต
BufferRemain        — ติดตาม remainNetWeightKGM และ MaximumWeight ต่อ LicenseDetail
Validate_Check_Weight — บันทึกการตรวจสอบน้ำหนักแต่ละครั้ง
Description         — รายละเอียดของการแจ้งขอตรวจสอบ (ผูกกับ licenseDetailID)
```

---

## CI/CD

GitHub Actions deploy อัตโนมัติเมื่อ push ไปที่ branch `main`

**Flow:** push to main → SSH เข้า server → `git pull` → `docker compose up --build`

ต้องตั้งค่า GitHub Secrets:

| Secret | Description |
|--------|-------------|
| `SSH_HOST` | IP address ของ server |
| `SSH_USER` | SSH username |
| `SSH_PASSWORD` | SSH password |

---

## Project Structure

```
src/
├── auth/                 # JWT authentication
├── admin/                # Admin module
├── certificate/          # Certificate module
├── company/              # Company module
├── dto/                  # DTO definitions (request.dto.ts, user.dto.ts, ...)
├── guards/               # JWT guard
├── orderbill/            # Order bill module
├── recordnotification/   # Check weight recording
├── statistic/            # Statistics
├── strategies/           # Passport strategies
├── trade/                # Trade & license management
└── user/                 # User module
```
