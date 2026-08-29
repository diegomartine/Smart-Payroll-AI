import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayslipsService {
  constructor(private readonly prisma: PrismaService) {}
  async getPayrollPayslips(payrollId: number) {
    const payroll = await this.prisma.payroll.findUnique({
      where: {
        id: payrollId,
      },
      include: {
        employees: {
          orderBy: {
            employeeId: 'asc',
          },
        },
      },
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${payrollId} not found`);
    }

    if (payroll.employees.length === 0) {
      throw new NotFoundException(
        `La nómina ${payroll.period} no tiene empleados registrados`,
      );
    }

    const payslips = await Promise.all(
      payroll.employees.map((payrollEmployee) =>
        this.getPayslip(payrollEmployee.id),
      ),
    );

    return {
      payrollId: payroll.id,
      period: payroll.period,
      employeesCount: payslips.length,
      payslips,
    };
  }

  async getPayslip(payrollEmployeeId: number) {
    const payrollEmployee = await this.prisma.payrollEmployee.findUnique({
      where: {
        id: payrollEmployeeId,
      },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
        payroll: true,
        novelties: true,
      },
    });

    if (!payrollEmployee) {
      throw new NotFoundException(
        `Payroll employee with ID ${payrollEmployeeId} not found`,
      );
    }

    /*
     * ============================
     * VALORES DE LA NÓMINA
     * ============================
     *
     * Estos valores representan el
     * resultado económico registrado
     * para el empleado en PayrollEmployee.
     */

    const baseSalary = Number(payrollEmployee.baseSalary ?? 0);
    const overtimeValue = Number(payrollEmployee.overtimeValue ?? 0);
    const bonus = Number(payrollEmployee.bonus ?? 0);
    const transportAllowance = Number(payrollEmployee.transportAllowance ?? 0);
    const otherIncome = Number(payrollEmployee.otherIncome ?? 0);

    const healthDeduction = Number(payrollEmployee.healthDeduction ?? 0);
    const pensionDeduction = Number(payrollEmployee.pensionDeduction ?? 0);
    const otherDeductions = Number(payrollEmployee.otherDeductions ?? 0);

    /*
     * ============================
     * DETALLE DE NOVEDADES
     * ============================
     *
     * Las novedades se muestran como
     * información adicional.
     *
     * NO se suman nuevamente al total,
     * porque PayrollEmployee ya contiene
     * los valores consolidados.
     */

    const noveltyEarnings = payrollEmployee.novelties
      .filter((novelty) =>
        ['BONUS', 'COMMISSION', 'ALLOWANCE', 'OTHER_EARNING'].includes(
          novelty.type,
        ),
      )
      .reduce((total, novelty) => total + Number(novelty.amount), 0);

    const noveltyDeductions = payrollEmployee.novelties
      .filter((novelty) =>
        ['DEDUCTION', 'OTHER_DEDUCTION'].includes(novelty.type),
      )
      .reduce((total, novelty) => total + Number(novelty.amount), 0);

    /*
     * ============================
     * TOTALES REALES DE LA NÓMINA
     * ============================
     */

    const totalEarnings =
      baseSalary + overtimeValue + bonus + transportAllowance + otherIncome;

    const totalDeductions =
      healthDeduction + pensionDeduction + otherDeductions;

    const calculatedNetPay = totalEarnings - totalDeductions;

    /*
     * netSalary es el valor registrado
     * en PayrollEmployee.
     *
     * Lo conservamos como referencia
     * para poder validar posteriormente
     * inconsistencias del Excel.
     */

    const netPay =
      payrollEmployee.netSalary !== null
        ? Number(payrollEmployee.netSalary)
        : calculatedNetPay;

    return {
      payrollEmployeeId: payrollEmployee.id,

      period: payrollEmployee.payroll.period,

      employee: {
        id: payrollEmployee.employee.id,
        employeeCode: payrollEmployee.employee.employeeCode,
        documentType: payrollEmployee.employee.documentType,
        documentNumber: payrollEmployee.employee.documentNumber,
        name: `${payrollEmployee.employee.firstName} ${payrollEmployee.employee.lastName}`,
        email: payrollEmployee.employee.email,
        position: payrollEmployee.employee.position.name,
        department: payrollEmployee.employee.department.name,
      },

      payroll: {
        workedDays: Number(payrollEmployee.workedDays ?? 0),
        baseSalary,
        overtimeHours: Number(payrollEmployee.overtimeHours ?? 0),
      },

      earnings: {
        baseSalary,
        overtimeValue,
        bonus,
        transportAllowance,
        otherIncome,

        // Solo informativo
        noveltyEarnings,
      },

      deductions: {
        healthDeduction,
        pensionDeduction,
        otherDeductions,

        // Solo informativo
        noveltyDeductions,
      },

      novelties: payrollEmployee.novelties.map((novelty) => ({
        id: novelty.id,
        type: novelty.type,
        description: novelty.description,
        quantity: novelty.quantity !== null ? Number(novelty.quantity) : null,
        amount: Number(novelty.amount),
        createdAt: novelty.createdAt,
      })),

      totalEarnings,
      totalDeductions,
      netPay,
    };
  }
}
