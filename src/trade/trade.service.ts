import { Inject, Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import express, { Request, Response } from 'express';
import * as https from 'https'; // สำหรับ HTTPS request
import * as http from 'http'; // สำหรับ fallback HTTP
import { parseStringPromise } from 'xml2js';
import { parse } from 'path';

@Injectable()
export class TradeService {
    [x: string]: any;
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,

    
  ) {}
 
  
  async  getData(req: Request, res: Response) {
  const ORGANCODE = 'e4d88b73-c523-440a-b60f-b243bfdfc540';
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const nextMonth = String(now.getMonth() + 2).padStart(2, '0');

  let StartDate = `${currentYear}-${currentMonth}-01`;
  let EndDate = `${currentYear}-${currentMonth}-31`;
  if (parseInt(nextMonth) > 12) {
    EndDate = `${currentYear + 1}-01-05`;
  }

  const STARTDATE = StartDate;
  const ENDDATE = EndDate;

  const xml = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                   xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <GetPaperlessData xmlns="http://tempuri.org/">
          <DataRequest>
            <OrganizeCode>${ORGANCODE}</OrganizeCode>
            <StartDate>${STARTDATE}</StartDate>
            <EndDate>${ENDDATE}</EndDate>
          </DataRequest>
        </GetPaperlessData>
      </soap:Body>
    </soap:Envelope>`;

  const options = {
    hostname: 'smart-1.dft.go.th',
    path: '/WebServices/DFTLicenseData.asmx',
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Content-Length': Buffer.byteLength(xml),
      'SOAPAction': '"http://tempuri.org/GetPaperlessData"',
    },
  };

  const soapRequest = (): Promise<string> =>
    new Promise((resolve, reject) => {
      const req = https.request(options, (soapRes) => {
        let data = '';
        soapRes.on('data', (chunk) => (data += chunk));
        soapRes.on('end', () => resolve(data));
      });

      req.on('error', (err) => reject(err));
      req.write(xml);
      req.end();
    });

  try {
    const rawXML = await soapRequest();
    const result = await parseStringPromise(rawXML, { explicitArray: false });

    const parsedList = result['soap:Envelope']['soap:Body']['GetPaperlessDataResponse']['GetPaperlessDataResult']['LicenseHeader'];

    const dataGovList: any[] = [];
    const licenseDetailList: any[] = [];

    for (const item of parsedList) {
    
        const exists = await this.prisma.dataFromGoverment.findUnique({
    where: { licenseNumber: item.LicenseNumber },
  });

  if (!exists) {
    console.log(`🔁 Skip: ${item.LicenseNumber} already exists`);
   
  
      const dataID = crypto.randomUUID();

      dataGovList.push({
        dataID,
        licenseNumber: item.LicenseNumber,
        exporter: item.Exporter,
        recipient: item.Recipient,
        buyer: item.Buyer || null,
        exportAgent: item.Export_Agent,
        companyTax: item.CompanyTax,
        product: item.Product,
        issueDate: convertToAD(item.IssueDate),
        expiredDate: convertToAD(item.ExpiredDate),
        exportDate: item.ExportDate ? convertToAD(item.ExportDate) : null,
        buyerCountry: item.BuyerCountry,
        destinationCountry: item.DestinationCountry,
        exportBy: item.ExportBy || null,
        vehicle: item.Vehicle,
        portName: item.PortName,
        currency: item.Currency,
        exchangeRate: parseFloat(item.ExchangeRate),
        permitConditions: item.PermitConditions,
      });

      const details = item.PaperlessDetail?.LicenseDetail;
      
      if (details) {
        const detailsArray = Array.isArray(details) ? details : [details];
        for (const detail of detailsArray) {
      const existsDetail = await this.prisma.licenseDetail.findFirst({
        where: {
          productDescription: detail.ProductDescription,
          price: parseFloat(detail.Price),
          netWeightTON: parseFloat(detail.NetWeightTON),
        },
      });

        if(!existsDetail ){
        licenseDetailList.push({
          permitId: dataID,
          tariffType: detail.TariffType,
          netWeightTON: parseFloat(detail.NetWeightTON),
          netWeightUnit: detail.NetWeightUnit,
          netWeightKGM: parseFloat(detail.NetWeightKGM),
          netWeightUnitKGM: detail.NetWeightUnitKGM,
          quantity: parseInt(detail.Quantity),
          quantityUnit: detail.QuantityUnit,
          pricePerUnit: parseFloat(detail.PricePerUnit),
          currencyPerTON: detail.CurrencyPerTON,
          fob: parseFloat(detail.FOB),
          price: parseFloat(detail.Price),
          incoterms: detail.Incoterms,
          productDescription: detail.ProductDescription,
        });
    }
      }
    }
}
    }

    await this.prisma.dataFromGoverment.createMany({ data: dataGovList, skipDuplicates: true });
    await this.prisma.licenseDetail.createMany({ data: licenseDetailList });
   console.log(licenseDetailList);
    return res.status(200).json({
      message: '✅ Data fetched and saved from SOAP service',
      inserted: parsedList,
    });
  } catch (err: any) {
    console.error('SOAP Error:', err);
    return res.status(500).json({
      message: '❌ Failed to fetch SOAP data',
      error: err.message || err,
    });
  }
}
  

}
function convertToAD(dateStr: string): Date {
  if (!dateStr || typeof dateStr !== 'string') {
    throw new Error(`Invalid date string: ${dateStr}`);
  }

  const [day, month, buddhistYear] = dateStr.split('/');
  if (!day || !month || !buddhistYear) {
    throw new Error(`Malformed Thai date: ${dateStr}`);
  }

  const year = parseInt(buddhistYear, 10) - 543;
  const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`;

  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid converted date: ${isoString}`);
  }

  return date;
}
