/** Swagger response example for endpoints returning `LicenseHistoryResponse`. */
export const LICENSE_HISTORY_EXAMPLE = {
  message: 'License history retrieved successfully',
  govData: {
    licenseNumber: '0308116920068',
    exporter: 'ซี.พี.อินเตอร์เทรด จำกัด',
    expiredDate: '2026-06-18T00:00:00.000Z',
    currency: 'USD',
    exchangeRate: 31.8975,
    destinationCountry: 'HONG KONG',
    licenseDetails: [
      {
        index: 1,
        licenseDetailID: '61a703b1-30f4-4eaa-90a3-cbdc23292dda',
        netWeightTON: 44,
        quantity: 1760,
        pricePerUnit: 632.18,
      },
    ],
  },
  data: [
    {
      licenseIndex: 1,
      licenseDetailID: '61a703b1-30f4-4eaa-90a3-cbdc23292dda',
      remainNetWeightKGM: 0,
      maximumWeight: 38000,
      records: [
        {
          jobID: 50,
          quantity: 600,
          totalNetWeight: 38000,
          loadingDetails: 'Loading in container',
          riceName: 'ข้าวเจ้าขาวอื่น 100 %',
          vehicleName: 'lic',
          shippingDateTime: '2026-05-18T19:30:00.000Z',
          surveyProvince: 'กาญจนบุรี',
          surveyName: 'KARNPANICH RICE MILL',
          portName: 'ท่าเรือกรุงเทพ/แหลมฉบัง',
          requestBy: 'ธกร',
        },
      ],
    },
  ],
};
