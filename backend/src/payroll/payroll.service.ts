import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { Payroll } from '../../generated/prisma/client';
import { UpdatePayrollDto } from './dto/update-payroll.dto';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPayrollDto: CreatePayrollDto): Promise<Payroll> {
    return this.prisma.payroll.create({
      data: {
        period: createPayrollDto.period,
        startDate: createPayrollDto.startDate,
        endDate: createPayrollDto.endDate,
      },
    });
  }

  findAll(): Promise<Payroll[]> {
    return this.prisma.payroll.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: number): Promise<Payroll> {
    return this.prisma.payroll
      .findUnique({
        where: { id },
      })
      .then((payroll) => {
        if (!payroll) {
          throw new NotFoundException(`Payroll with ID ${id} not found`);
        }

        return payroll;
      });
  }
  update(id: number, updatePayrollDto: UpdatePayrollDto): Promise<Payroll> {
    return this.prisma.payroll.update({
      where: { id },
      data: updatePayrollDto,
    });
  }
  remove(id: number): Promise<Payroll> {
    return this.prisma.payroll.delete({
      where: { id },
    });
  }
  addEmployee(payrollId: number, employeeId: number) {
    return this.prisma.payrollEmployee.create({
      data: {
        payrollId,
        employeeId,
      },
    });
  }
  findEmployees(payrollId: number) {
    return this.prisma.payrollEmployee.findMany({
      where: {
        payrollId,
      },
      include: {
        employee: true,
      },
    });
  }
  removeEmployee(payrollId: number, employeeId: number) {
    return this.prisma.payrollEmployee.delete({
      where: {
        payrollId_employeeId: {
          payrollId,
          employeeId,
        },
      },
    });
  }
}
