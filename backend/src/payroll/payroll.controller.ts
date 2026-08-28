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
import { UpdatePayrollNoveltyDto } from './dto/update-payroll-novelty.dto';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { UpdatePayrollStatusDto } from './dto/update-payroll-status.dto';
import { CreatePayrollNoveltyDto } from './dto/create-payroll-novelty.dto';
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
  @Get('employees/:payrollEmployeeId/calculate')
  calculatePayrollEmployee(
    @Param('payrollEmployeeId') payrollEmployeeId: string,
  ) {
    return this.payrollService.calculatePayrollEmployee(
      Number(payrollEmployeeId),
    );
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
  @Post(':id/employees/:employeeId/novelties')
  addNovelty(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
    @Body() createPayrollNoveltyDto: CreatePayrollNoveltyDto,
  ) {
    return this.payrollService.addNovelty(
      Number(id),
      Number(employeeId),
      createPayrollNoveltyDto,
    );
  }

  @Get(':id/employees/:employeeId/novelties')
  findNovelties(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.payrollService.findNovelties(Number(id), Number(employeeId));
  }
  @Patch('novelties/:noveltyId')
  updateNovelty(
    @Param('noveltyId') noveltyId: string,
    @Body() updatePayrollNoveltyDto: UpdatePayrollNoveltyDto,
  ) {
    return this.payrollService.updateNovelty(
      Number(noveltyId),
      updatePayrollNoveltyDto,
    );
  }

  @Delete('novelties/:noveltyId')
  removeNovelty(@Param('noveltyId') noveltyId: string) {
    return this.payrollService.removeNovelty(Number(noveltyId));
  }
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdatePayrollStatusDto) {
    console.log('BODY RECIBIDO:', dto);

    return this.payrollService.updateStatus(Number(id), dto.status);
  }
}
