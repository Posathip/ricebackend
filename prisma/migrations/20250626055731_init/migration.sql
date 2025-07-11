-- CreateTable
CREATE TABLE "DataFromGoverment" (
    "dataID" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "exporter" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "buyer" TEXT,
    "exportAgent" TEXT NOT NULL,
    "companyTax" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiredDate" TIMESTAMP(3) NOT NULL,
    "exportDate" TIMESTAMP(3),
    "buyerCountry" TEXT NOT NULL,
    "destinationCountry" TEXT NOT NULL,
    "exportBy" TEXT,
    "vehicle" TEXT NOT NULL,
    "portName" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "permitConditions" TEXT NOT NULL,

    CONSTRAINT "DataFromGoverment_pkey" PRIMARY KEY ("dataID")
);

-- CreateTable
CREATE TABLE "LicenseDetail" (
    "licenseDetailID" TEXT NOT NULL,
    "permitId" TEXT NOT NULL,
    "tariffType" TEXT NOT NULL,
    "netWeightTON" DOUBLE PRECISION NOT NULL,
    "netWeightUnit" TEXT NOT NULL,
    "netWeightKGM" DOUBLE PRECISION NOT NULL,
    "netWeightUnitKGM" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "quantityUnit" TEXT NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "currencyPerTON" TEXT NOT NULL,
    "fob" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "incoterms" TEXT NOT NULL,
    "productDescription" TEXT NOT NULL,

    CONSTRAINT "LicenseDetail_pkey" PRIMARY KEY ("licenseDetailID")
);

-- CreateTable
CREATE TABLE "Company" (
    "companyID" TEXT NOT NULL,
    "companyNameEN" TEXT NOT NULL,
    "companyNameTH" TEXT NOT NULL,
    "companyDescription" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("companyID")
);

-- CreateTable
CREATE TABLE "Request" (
    "requestID" TEXT NOT NULL,
    "companyID" TEXT NOT NULL,
    "requestBy" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL,
    "shippingDate" TEXT NOT NULL,
    "shippingTime" TEXT NOT NULL,
    "surveyDistrict" TEXT NOT NULL,
    "surveyLocateName" TEXT NOT NULL,
    "surveyPaidBy" TEXT NOT NULL,
    "surveyProvince" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "godown" TEXT NOT NULL,
    "legacyRequestID" INTEGER NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("requestID")
);

-- CreateTable
CREATE TABLE "Description" (
    "descriptionID" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "productDescription" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "quantityUnit" TEXT NOT NULL,
    "weightLeft" DOUBLE PRECISION NOT NULL,
    "grossWeight" DOUBLE PRECISION NOT NULL,
    "licenseID" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "netWeight" DOUBLE PRECISION NOT NULL,
    "riceTypeExtra" TEXT NOT NULL,
    "riceTypeID" TEXT NOT NULL,
    "subID" INTEGER NOT NULL,
    "vehicleName" TEXT NOT NULL,

    CONSTRAINT "Description_pkey" PRIMARY KEY ("descriptionID")
);

-- CreateTable
CREATE TABLE "validate_Check_Weight" (
    "checkWeightID" TEXT NOT NULL,
    "LoadingDetail1" TEXT NOT NULL,
    "Time" TEXT NOT NULL,
    "bagQuantity" INTEGER NOT NULL,
    "grossWeight" DOUBLE PRECISION,
    "jobID" INTEGER NOT NULL,
    "licenseID" TEXT NOT NULL,
    "netWeight" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "requestID" INTEGER NOT NULL,
    "riceTypeID" TEXT NOT NULL,
    "shippingDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "validate_Check_Weight_pkey" PRIMARY KEY ("checkWeightID")
);

-- CreateTable
CREATE TABLE "certificatesheet" (
    "CertificatesheetID" TEXT NOT NULL,
    "jobID" TEXT NOT NULL,
    "License" TEXT NOT NULL,
    "No" INTEGER NOT NULL,
    "NoOld" INTEGER NOT NULL,
    "PackingType1" TEXT NOT NULL,
    "PackingType11" TEXT NOT NULL,
    "PackingType12" TEXT NOT NULL,
    "PackingType2" TEXT NOT NULL,
    "Quality1string" TEXT NOT NULL,
    "Quality2string" TEXT NOT NULL,
    "ShipperBehalf" TEXT NOT NULL,
    "TotalGross" TEXT NOT NULL,
    "TotalNett" DOUBLE PRECISION NOT NULL,
    "TotalTare" TEXT NOT NULL,
    "Weightstring" TEXT NOT NULL,
    "bagQuantity" TEXT NOT NULL,
    "companyEN" TEXT NOT NULL,
    "currentDate" TEXT NOT NULL,
    "destinationCity" TEXT NOT NULL,
    "godown" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "shippingDate" TEXT NOT NULL,
    "shippingPort" TEXT NOT NULL,
    "subID" TEXT NOT NULL,
    "title1string" TEXT NOT NULL,
    "vehicleName" TEXT NOT NULL,

    CONSTRAINT "certificatesheet_pkey" PRIMARY KEY ("CertificatesheetID")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashpassword" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleUserLevel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now())
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_password_key" ON "User"("password");

-- AddForeignKey
ALTER TABLE "LicenseDetail" ADD CONSTRAINT "LicenseDetail_permitId_fkey" FOREIGN KEY ("permitId") REFERENCES "DataFromGoverment"("dataID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Description" ADD CONSTRAINT "Description_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("requestID") ON DELETE RESTRICT ON UPDATE CASCADE;
