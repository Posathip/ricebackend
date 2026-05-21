import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    // console.log('[AppService.getHello]');
    const result = 'Hello World!';
    // console.log('[AppService.getHello] result:', result);
    return result;
  }
}
