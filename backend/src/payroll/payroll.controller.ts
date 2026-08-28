import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { AddEmployeeToPayrollDto } from './dto/add-employee-to-payroll.dto';
import { Payroll } from '../../generated/prisma/client';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  create(@Body() createPayrollDto: CreatePayrollDto) {
    return this.payrollService.create(createPayrollDto);
  }
  @Get()
  findAll() {
    return this.payrollService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Payroll> {
    return this.payrollService.findOne(Number(id));
  }
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePayrollDto: UpdatePayrollDto,
  ): Promise<Payroll> {
    return this.payrollService.update(Number(id), updatePayrollDto);
  }
  @Delete(':id')
  remove(@Param('id') id: string): Promise<Payroll> {
    return this.payrollService.remove(Number(id));
  }
  @Post(':id/employees')
  addEmployee(@Param('id') id: string, @Body() dto: AddEmployeeToPayrollDto) {
    return this.payrollService.addEmployee(Number(id), dto.employeeId);
  }
  @Get(':id/employees')
  findEmployees(@Param('id') id: string) {
    return this.payrollService.findEmployees(Number(id));
  }
  @Delete(':id/employees/:employeeId')
  removeEmployee(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.payrollService.removeEmployee(Number(id), Number(employeeId));
  }
}
