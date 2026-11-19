import { InternalServerErrorException } from '@nestjs/common';

const BUDDHIST_ERA_OFFSET = 543;
const DECIMAL_RADIX = 10;
const COMPANY_PREFIX_PATTERN = /^บริษัท\s*/;
const COMPANY_SUFFIX = 'จำกัด';
const PACKING_KEYWORD = 'บรรจุ';
const TELEPHONE_PATTERN = /Tel\.?\s*([0-9]+)/;
const NAME_TITLE_PREFIXES = ['ว่าที่ร้อยตรี', 'นางสาว', 'นาง', 'นาย'];
const FIRST_NAME_PATTERN = new RegExp(
  `^(?:${NAME_TITLE_PREFIXES.join('|')})\\s*([\\u0E00-\\u0E7Fa-zA-Z]+)`,
  'u',
);

/** Keeps the rice type up to the first "%" or before "บรรจุ" (packing description). */
export function cleanRiceType(riceType: string): string {
  if (!riceType) return riceType;

  const percentIndex = riceType.indexOf('%');
  if (percentIndex !== -1) return riceType.substring(0, percentIndex + 1).trim();

  const packingIndex = riceType.indexOf(PACKING_KEYWORD);
  if (packingIndex !== -1) return riceType.substring(0, packingIndex).trim();

  return riceType.trim();
}

/** Removes the leading "บริษัท" and anything after "จำกัด". */
export function cleanCompanyName(companyName: string): string {
  if (!companyName) return companyName;

  const withoutPrefix = companyName.replace(COMPANY_PREFIX_PATTERN, '');
  const suffixIndex = withoutPrefix.indexOf(COMPANY_SUFFIX);
  if (suffixIndex !== -1) {
    return withoutPrefix.substring(0, suffixIndex + COMPANY_SUFFIX.length).trim();
  }
  return withoutPrefix.trim();
}

/** Converts a Thai Buddhist-era date "dd/mm/yyyy" (from the government SOAP feed) to a UTC Date. */
export function convertBuddhistDateToAD(dateStr: string): Date {
  if (!dateStr || typeof dateStr !== 'string') {
    throw new InternalServerErrorException(`Invalid date string: ${dateStr}`);
  }

  const [day, month, buddhistYear] = dateStr.split('/');
  if (!day || !month || !buddhistYear) {
    throw new InternalServerErrorException(`Malformed Thai date: ${dateStr}`);
  }

  const year = parseInt(buddhistYear, DECIMAL_RADIX) - BUDDHIST_ERA_OFFSET;
  const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    throw new InternalServerErrorException(`Invalid converted date: ${isoString}`);
  }
  return date;
}

export function extractTelephone(text: string | undefined): string {
  const match = text?.match(TELEPHONE_PATTERN);
  return match ? match[1].trim() : '';
}

/** Returns the first name after a Thai title (นาย / นาง / นางสาว / ว่าที่ร้อยตรี). */
export function extractFirstName(text: string | undefined): string {
  const match = text?.match(FIRST_NAME_PATTERN);
  return match ? match[1].trim() : '';
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** xml2js with `explicitArray: false` returns a single object when there is only one element. */
export function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}
