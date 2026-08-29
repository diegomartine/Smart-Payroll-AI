import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import {
  DocumentType,
  EmploymentStatus,
  PayrollNoveltyType,
} from '../../generated/prisma/enums';

@Injectable()
export class ImportsService {
  constructor(private readonly prisma: PrismaService) {}

  async importEmployees(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Debe proporcionar un archivo Excel');
    }

    const fileName = file.originalname;

    const match = fileName.match(/^nomina_(\d{4}-\d{2})\.xlsx$/i);

    if (!match) {
      throw new BadRequestException(
        'El archivo debe tener el formato nomina_YYYY-MM.xlsx',
      );
    }

    const payrollPeriod = match[1];

    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
    });

    const requiredSheets = ['Employees', 'Payroll', 'Novelties'];

    const missingSheets = requiredSheets.filter(
      (sheet) => !workbook.SheetNames.includes(sheet),
    );

    if (missingSheets.length > 0) {
      throw new BadRequestException(
        `Faltan hojas requeridas: ${missingSheets.join(', ')}`,
      );
    }

    const employees = this.readSheet(workbook, 'Employees');
    const payroll = this.readSheet(workbook, 'Payroll');
    const novelties = this.readSheet(workbook, 'Novelties');

    this.validateColumns('Employees', employees, [
      'employeeCode',
      'documentType',
      'documentNumber',
      'firstName',
      'lastName',
      'email',
      'phone',
      'department',
      'position',
      'baseSalary',
      'hireDate',
      'employmentStatus',
    ]);

    this.validateColumns('Payroll', payroll, [
      'employeeCode',
      'payrollPeriod',
      'workedDays',
      'baseSalary',
      'overtimeHours',
      'overtimeValue',
      'bonus',
      'transportAllowance',
      'otherIncome',
      'healthDeduction',
      'pensionDeduction',
      'otherDeductions',
      'netSalary',
    ]);

    this.validateColumns('Novelties', novelties, [
      'employeeCode',
      'payrollPeriod',
      'noveltyType',
      'description',
      'quantity',
      'value',
      'date',
    ]);

    const result = await this.prisma.$transaction(async (tx) => {
      /*
       * 1. Crear o actualizar empleados
       */
      const importedEmployees = new Map<string, number>();

      for (const row of employees) {
        const employeeCode = String(row.employeeCode).trim();

        const department = await tx.department.upsert({
          where: {
            name: String(row.department).trim(),
          },
          update: {
            isActive: true,
          },
          create: {
            name: String(row.department).trim(),
          },
        });

        const position = await tx.position.upsert({
          where: {
            name: String(row.position).trim(),
          },
          update: {
            isActive: true,
          },
          create: {
            name: String(row.position).trim(),
          },
        });

        const employee = await tx.employee.upsert({
          where: {
            employeeCode,
          },
          update: {
            documentType: this.toEnum<DocumentType>(
              row.documentType,
              'documentType',
            ),
            documentNumber: String(row.documentNumber).trim(),
            firstName: String(row.firstName).trim(),
            lastName: String(row.lastName).trim(),
            email: this.toNullableString(row.email),
            phone: this.toNullableString(row.phone),
            departmentId: department.id,
            positionId: position.id,
            baseSalary: this.toNumber(row.baseSalary),
            hireDate: this.toDate(row.hireDate),
            employmentStatus: this.toEnum<EmploymentStatus>(
              row.employmentStatus || 'ACTIVE',
              'employmentStatus',
            ),
          },
          create: {
            employeeCode,
            documentType: this.toEnum<DocumentType>(
              row.documentType,
              'documentType',
            ),
            documentNumber: String(row.documentNumber).trim(),
            firstName: String(row.firstName).trim(),
            lastName: String(row.lastName).trim(),
            email: this.toNullableString(row.email),
            phone: this.toNullableString(row.phone),
            departmentId: department.id,
            positionId: position.id,
            baseSalary: this.toNumber(row.baseSalary),
            hireDate: this.toDate(row.hireDate),
            employmentStatus: this.toEnum<EmploymentStatus>(
              row.employmentStatus || 'ACTIVE',
              'employmentStatus',
            ),
          },
        });

        importedEmployees.set(employeeCode, employee.id);
      }

      /*
       * 2. Crear o reutilizar la nómina del período
       */
      const existingPayroll = await tx.payroll.findFirst({
        where: {
          period: payrollPeriod,
        },
      });

      const payrollRecord =
        existingPayroll ??
        (await tx.payroll.create({
          data: {
            period: payrollPeriod,
            startDate: this.getPeriodStartDate(payrollPeriod),
            endDate: this.getPeriodEndDate(payrollPeriod),
          },
        }));

      /*
       * 3. Crear o actualizar empleados dentro de la nómina
       */
      const importedPayrollEmployees = new Map<string, number>();

      for (const row of payroll) {
        const employeeCode = String(row.employeeCode).trim();
        const rowPayrollPeriod = String(row.payrollPeriod).trim();

        if (rowPayrollPeriod !== payrollPeriod) {
          throw new BadRequestException(
            `El empleado ${employeeCode} pertenece al período ${rowPayrollPeriod} y el archivo es ${payrollPeriod}`,
          );
        }

        const employeeId = importedEmployees.get(employeeCode);

        if (!employeeId) {
          throw new BadRequestException(
            `El empleado ${employeeCode} de Payroll no existe en Employees`,
          );
        }

        const payrollEmployee = await tx.payrollEmployee.upsert({
          where: {
            payrollId_employeeId: {
              payrollId: payrollRecord.id,
              employeeId,
            },
          },
          update: {
            workedDays: this.toNullableNumber(row.workedDays),
            baseSalary: this.toNullableNumber(row.baseSalary),
            overtimeHours: this.toNumberOrZero(row.overtimeHours),
            overtimeValue: this.toNumberOrZero(row.overtimeValue),
            bonus: this.toNumberOrZero(row.bonus),
            transportAllowance: this.toNumberOrZero(row.transportAllowance),
            otherIncome: this.toNumberOrZero(row.otherIncome),
            healthDeduction: this.toNumberOrZero(row.healthDeduction),
            pensionDeduction: this.toNumberOrZero(row.pensionDeduction),
            otherDeductions: this.toNumberOrZero(row.otherDeductions),
            netSalary: this.toNullableNumber(row.netSalary),
          },
          create: {
            payrollId: payrollRecord.id,
            employeeId,
            workedDays: this.toNullableNumber(row.workedDays),
            baseSalary: this.toNullableNumber(row.baseSalary),
            overtimeHours: this.toNumberOrZero(row.overtimeHours),
            overtimeValue: this.toNumberOrZero(row.overtimeValue),
            bonus: this.toNumberOrZero(row.bonus),
            transportAllowance: this.toNumberOrZero(row.transportAllowance),
            otherIncome: this.toNumberOrZero(row.otherIncome),
            healthDeduction: this.toNumberOrZero(row.healthDeduction),
            pensionDeduction: this.toNumberOrZero(row.pensionDeduction),
            otherDeductions: this.toNumberOrZero(row.otherDeductions),
            netSalary: this.toNullableNumber(row.netSalary),
          },
        });

        importedPayrollEmployees.set(employeeCode, payrollEmployee.id);
      }

      /*
       * 4. Reemplazar las novedades de los empleados importados
       *
       * El Excel es la fuente de verdad.
       * Al volver a importar el mismo período no se duplican novedades.
       */
      const payrollEmployeeIds = Array.from(importedPayrollEmployees.values());

      await tx.payrollNovelty.deleteMany({
        where: {
          payrollEmployeeId: {
            in: payrollEmployeeIds,
          },
        },
      });

      let noveltiesImported = 0;

      for (const row of novelties) {
        const employeeCode = String(row.employeeCode).trim();

        if (String(row.payrollPeriod).trim() !== payrollPeriod) {
          throw new BadRequestException(
            `La novedad del empleado ${employeeCode} pertenece al período ${row.payrollPeriod} y el archivo es ${payrollPeriod}`,
          );
        }

        const payrollEmployeeId = importedPayrollEmployees.get(employeeCode);

        if (!payrollEmployeeId) {
          throw new BadRequestException(
            `El empleado ${employeeCode} de Novelties no existe en Payroll`,
          );
        }

        await tx.payrollNovelty.create({
          data: {
            payrollEmployeeId,
            type: this.toEnum<PayrollNoveltyType>(
              row.noveltyType,
              'noveltyType',
            ),
            description: this.toNullableString(row.description),
            quantity: this.toNullableNumber(row.quantity),
            amount: this.toNumber(row.value),
          },
        });

        noveltiesImported++;
      }

      return {
        payrollId: payrollRecord.id,
        employeesImported: importedEmployees.size,
        payrollEmployeesImported: importedPayrollEmployees.size,
        noveltiesImported,
      };
    });

    return {
      message: 'Excel importado correctamente',
      fileName,
      payrollPeriod,
      ...result,
    };
  }

  private readSheet(
    workbook: XLSX.WorkBook,
    sheetName: string,
  ): Record<string, any>[] {
    const worksheet = workbook.Sheets[sheetName];

    return XLSX.utils.sheet_to_json(worksheet, {
      defval: null,
    });
  }

  private validateColumns(
    sheetName: string,
    rows: Record<string, any>[],
    requiredColumns: string[],
  ) {
    if (rows.length === 0) {
      throw new BadRequestException(`La hoja ${sheetName} está vacía`);
    }

    const columns = Object.keys(rows[0]);

    const missingColumns = requiredColumns.filter(
      (column) => !columns.includes(column),
    );

    if (missingColumns.length > 0) {
      throw new BadRequestException(
        `En la hoja ${sheetName} faltan columnas: ${missingColumns.join(', ')}`,
      );
    }
  }

  private toNumber(value: any): number {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      throw new BadRequestException(`Valor numérico inválido: ${value}`);
    }

    return number;
  }

  private toNullableNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    return this.toNumber(value);
  }

  private toNumberOrZero(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    return this.toNumber(value);
  }

  private toNullableString(value: any): string | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    return String(value).trim();
  }

  private toDate(value: any): Date {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Fecha inválida: ${value}`);
    }

    return date;
  }

  private toEnum<T>(value: any, fieldName: string): T {
    if (value === null || value === undefined || value === '') {
      throw new BadRequestException(`El campo ${fieldName} es obligatorio`);
    }

    return String(value).trim().toUpperCase() as T;
  }

  private getPeriodStartDate(period: string): Date {
    const [year, month] = period.split('-').map(Number);

    return new Date(Date.UTC(year, month - 1, 1));
  }

  private getPeriodEndDate(period: string): Date {
    const [year, month] = period.split('-').map(Number);

    return new Date(Date.UTC(year, month, 0));
  }
}
