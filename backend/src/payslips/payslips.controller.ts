import { Controller, Get, Param } from '@nestjs/common';
import { PayslipsService } from './payslips.service';

@Controller('payslips')
export class PayslipsController {
  constructor(private readonly payslipsService: PayslipsService) {}

  @Get('payroll-employee/:id')
  getPayslip(@Param('id') id: string) {
    return this.payslipsService.getPayslip(Number(id));
  }

  @Get('payroll/:id')
  getPayrollPayslips(@Param('id') id: string) {
    return this.payslipsService.getPayrollPayslips(Number(id));
  }
}
