import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      service: 'Smart Payroll AI',
      version: '1.0.0',
    };
  }
}
