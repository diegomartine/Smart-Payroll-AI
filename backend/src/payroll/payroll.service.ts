import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePayrollNoveltyDto } from './dto/create-payroll-novelty.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { Payroll, PayrollStatus, Prisma } from '../../generated/prisma/client';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { UpdatePayrollNoveltyDto } from './dto/update-payroll-novelty.dto';

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
  async addEmployee(payrollId: number, employeeId: number) {
    await this.validatePayrollEditable(payrollId);
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
  async removeEmployee(payrollId: number, employeeId: number) {
    await this.validatePayrollEditable(payrollId);

    return this.prisma.payrollEmployee.delete({
      where: {
        payrollId_employeeId: {
          payrollId,
          employeeId,
        },
      },
    });
  }
  async addNovelty(
    payrollId: number,
    employeeId: number,
    createPayrollNoveltyDto: CreatePayrollNoveltyDto,
  ) {
    await this.validatePayrollEditable(payrollId);
    const payrollEmployee = await this.prisma.payrollEmployee.findUnique({
      where: {
        payrollId_employeeId: {
          payrollId,
          employeeId,
        },
      },
    });

    if (!payrollEmployee) {
      throw new NotFoundException(
        `Employee with ID ${employeeId} is not assigned to payroll ${payrollId}`,
      );
    }

    return this.prisma.payrollNovelty.create({
      data: {
        payrollEmployeeId: payrollEmployee.id,
        type: createPayrollNoveltyDto.type,
        description: createPayrollNoveltyDto.description,
        quantity: createPayrollNoveltyDto.quantity,
        amount: createPayrollNoveltyDto.amount,
      },
    });
  }
  async findNovelties(payrollId: number, employeeId: number) {
    const payrollEmployee = await this.prisma.payrollEmployee.findUnique({
      where: {
        payrollId_employeeId: {
          payrollId,
          employeeId,
        },
      },
    });

    if (!payrollEmployee) {
      throw new NotFoundException(
        `Employee with ID ${employeeId} is not assigned to payroll ${payrollId}`,
      );
    }

    return this.prisma.payrollNovelty.findMany({
      where: {
        payrollEmployeeId: payrollEmployee.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async updateNovelty(
    id: number,
    updatePayrollNoveltyDto: UpdatePayrollNoveltyDto,
  ) {
    const novelty = await this.prisma.payrollNovelty.findUnique({
      where: {
        id,
      },
    });

    if (!novelty) {
      throw new NotFoundException(`Payroll novelty with ID ${id} not found`);
    }

    const payrollEmployee = await this.prisma.payrollEmployee.findUnique({
      where: {
        id: novelty.payrollEmployeeId,
      },
    });

    if (!payrollEmployee) {
      throw new NotFoundException(
        `Payroll employee with ID ${novelty.payrollEmployeeId} not found`,
      );
    }

    await this.validatePayrollEditable(payrollEmployee.payrollId);

    return this.prisma.payrollNovelty.update({
      where: {
        id,
      },
      data: updatePayrollNoveltyDto,
    });
  }
  async removeNovelty(id: number) {
    const novelty = await this.prisma.payrollNovelty.findUnique({
      where: {
        id,
      },
    });

    if (!novelty) {
      throw new NotFoundException(`Payroll novelty with ID ${id} not found`);
    }

    const payrollEmployee = await this.prisma.payrollEmployee.findUnique({
      where: {
        id: novelty.payrollEmployeeId,
      },
    });

    if (!payrollEmployee) {
      throw new NotFoundException(
        `Payroll employee with ID ${novelty.payrollEmployeeId} not found`,
      );
    }

    await this.validatePayrollEditable(payrollEmployee.payrollId);

    return this.prisma.payrollNovelty.delete({
      where: {
        id,
      },
    });
  }

  private async validatePayrollEditable(payrollId: number) {
    const payroll = await this.prisma.payroll.findUnique({
      where: {
        id: payrollId,
      },
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${payrollId} not found`);
    }

    if (payroll.status !== 'DRAFT') {
      throw new BadRequestException(
        `Payroll with ID ${payrollId} cannot be modified because its status is ${payroll.status}`,
      );
    }

    return payroll;
  }

  async updateStatus(id: number, status: PayrollStatus) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${id} not found`);
    }

    const validTransitions: Record<PayrollStatus, PayrollStatus[]> = {
      DRAFT: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[payroll.status].includes(status)) {
      throw new BadRequestException(
        `Cannot change payroll status from ${payroll.status} to ${status}`,
      );
    }

    return this.prisma.payroll.update({
      where: { id },
      data: { status },
    });
  }
  async calculatePayrollEmployee(payrollEmployeeId: number) {
    const payrollEmployee = await this.prisma.payrollEmployee.findUnique({
      where: {
        id: payrollEmployeeId,
      },
      include: {
        employee: true,
        novelties: true,
      },
    });

    if (!payrollEmployee) {
      throw new NotFoundException(
        `Payroll employee with ID ${payrollEmployeeId} not found`,
      );
    }

    const baseSalary = new Prisma.Decimal(
      payrollEmployee.baseSalary ?? payrollEmployee.employee.baseSalary,
    );

    let totalEarnings = baseSalary
      .plus(payrollEmployee.overtimeValue ?? 0)
      .plus(payrollEmployee.bonus ?? 0)
      .plus(payrollEmployee.transportAllowance ?? 0)
      .plus(payrollEmployee.otherIncome ?? 0);

    let totalDeductions = new Prisma.Decimal(0);

    totalDeductions = totalDeductions
      .plus(payrollEmployee.healthDeduction ?? 0)
      .plus(payrollEmployee.pensionDeduction ?? 0)
      .plus(payrollEmployee.otherDeductions ?? 0);

    for (const novelty of payrollEmployee.novelties) {
      if (
        novelty.type === 'OVERTIME' ||
        novelty.type === 'BONUS' ||
        novelty.type === 'COMMISSION' ||
        novelty.type === 'ALLOWANCE' ||
        novelty.type === 'OTHER_EARNING'
      ) {
        totalEarnings = totalEarnings.plus(novelty.amount);
      } else {
        totalDeductions = totalDeductions.plus(novelty.amount);
      }
    }

    const netPay = totalEarnings.minus(totalDeductions);

    await this.prisma.payrollEmployee.update({
      where: {
        id: payrollEmployeeId,
      },
      data: {
        netSalary: netPay,
      },
    });

    return {
      payrollEmployeeId,
      employee: {
        id: payrollEmployee.employee.id,
        employeeCode: payrollEmployee.employee.employeeCode,
        name: `${payrollEmployee.employee.firstName} ${payrollEmployee.employee.lastName}`,
      },
      payroll: {
        workedDays: payrollEmployee.workedDays,
        baseSalary,
        overtimeHours: payrollEmployee.overtimeHours,
        overtimeValue: payrollEmployee.overtimeValue,
        bonus: payrollEmployee.bonus,
        transportAllowance: payrollEmployee.transportAllowance,
        otherIncome: payrollEmployee.otherIncome,
        healthDeduction: payrollEmployee.healthDeduction,
        pensionDeduction: payrollEmployee.pensionDeduction,
        otherDeductions: payrollEmployee.otherDeductions,
      },
      novelties: payrollEmployee.novelties,
      totalEarnings,
      totalDeductions,
      netPay,
    };
  }
}
