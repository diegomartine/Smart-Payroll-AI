import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalysisService {
  constructor(private readonly prisma: PrismaService) {}

  async analyzePayroll(payrollId: number) {
    const payroll = await this.prisma.payroll.findUnique({
      where: {
        id: payrollId,
      },
      include: {
        employees: {
          include: {
            employee: true,
            novelties: true,
          },
        },
      },
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${payrollId} not found`);
    }

    if (payroll.employees.length === 0) {
      return {
        payrollId,
        period: payroll.period,
        employeesCount: 0,
        totalPayroll: 0,
        message: 'La nómina no tiene empleados registrados',
      };
    }

    const positiveNoveltyTypes = [
      'OVERTIME',
      'BONUS',
      'COMMISSION',
      'ALLOWANCE',
      'OTHER_EARNING',
    ];

    const employees = payroll.employees.map((item) => {
      const baseSalary = Number(item.baseSalary ?? 0);
      const overtimeValue = Number(item.overtimeValue ?? 0);
      const bonus = Number(item.bonus ?? 0);
      const transportAllowance = Number(item.transportAllowance ?? 0);
      const otherIncome = Number(item.otherIncome ?? 0);

      const healthDeduction = Number(item.healthDeduction ?? 0);
      const pensionDeduction = Number(item.pensionDeduction ?? 0);
      const otherDeductions = Number(item.otherDeductions ?? 0);

      const positiveNovelties = item.novelties
        .filter((novelty) => positiveNoveltyTypes.includes(novelty.type))
        .reduce((total, novelty) => total + Number(novelty.amount), 0);

      const negativeNovelties = item.novelties
        .filter((novelty) => !positiveNoveltyTypes.includes(novelty.type))
        .reduce((total, novelty) => total + Number(novelty.amount), 0);

      const totalEarnings =
        baseSalary +
        overtimeValue +
        bonus +
        transportAllowance +
        otherIncome +
        positiveNovelties;

      const totalDeductions =
        healthDeduction +
        pensionDeduction +
        otherDeductions +
        negativeNovelties;

      const netSalary = Number(item.netSalary ?? 0);

      return {
        payrollEmployeeId: item.id,
        employeeCode: item.employee.employeeCode,
        name: `${item.employee.firstName} ${item.employee.lastName}`,
        netSalary,

        earnings: {
          baseSalary,
          overtimeValue,
          bonus,
          transportAllowance,
          otherIncome,
          positiveNovelties,
        },

        deductions: {
          healthDeduction,
          pensionDeduction,
          otherDeductions,
          negativeNovelties,
        },

        totalEarnings,
        totalDeductions,

        noveltiesCount: item.novelties.length,
      };
    });

    const highestPaid = employees.reduce((highest, current) =>
      current.netSalary > highest.netSalary ? current : highest,
    );

    const totalPayroll = employees.reduce(
      (total, employee) => total + employee.netSalary,
      0,
    );

    /*
     * Factores que explican el pago del empleado
     * con mayor salario neto.
     *
     * El salario base se muestra como referencia,
     * pero el "factor adicional" será el ingreso
     * adicional más importante.
     */
    const factors = [
      {
        factor: 'Salario base',
        amount: highestPaid.earnings.baseSalary,
      },
      {
        factor: 'Novedades positivas',
        amount: highestPaid.earnings.positiveNovelties,
      },
      {
        factor: 'Bonos',
        amount: highestPaid.earnings.bonus,
      },
      {
        factor: 'Horas extra',
        amount: highestPaid.earnings.overtimeValue,
      },
      {
        factor: 'Auxilio de transporte',
        amount: highestPaid.earnings.transportAllowance,
      },
      {
        factor: 'Otros ingresos',
        amount: highestPaid.earnings.otherIncome,
      },
    ]
      .filter((factor) => factor.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    const additionalFactors = factors.filter(
      (factor) => factor.factor !== 'Salario base',
    );

    const mainAdditionalFactor =
      additionalFactors.length > 0 ? additionalFactors[0] : null;

    const formattedNetSalary = highestPaid.netSalary.toLocaleString('es-CO');

    const analysis = mainAdditionalFactor
      ? `${highestPaid.name} recibió el mayor pago de la nómina con un salario neto de $${formattedNetSalary}. El factor adicional que más incrementó su pago fue ${mainAdditionalFactor.factor}, con un valor de $${mainAdditionalFactor.amount.toLocaleString('es-CO')}.`
      : `${highestPaid.name} recibió el mayor pago de la nómina con un salario neto de $${formattedNetSalary}.`;

    return {
      payrollId: payroll.id,
      period: payroll.period,
      employeesCount: employees.length,
      totalPayroll,

      highestPaidEmployee: {
        payrollEmployeeId: highestPaid.payrollEmployeeId,
        employeeCode: highestPaid.employeeCode,
        name: highestPaid.name,
        netSalary: highestPaid.netSalary,
      },

      factors,

      analysis,

      employees,
    };
  }
}
