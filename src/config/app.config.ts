import { registerAs } from '@nestjs/config';
export const jwt_Access_Secret = process.env.JWT_ACCESS_SECRET;
export const jwt_Refresh_Secret = process.env.JWT_REFRESH_SECRET;
export default registerAs('app', () => ({
  host: process.env.APP_HOST || '0.0.0.0',
  port: process.env.APP_PORT || '90',
}));

