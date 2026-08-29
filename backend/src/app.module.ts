import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeesModule } from './employees/employees.module';
import { PayrollModule } from './payroll/payroll.module';
import { DepartmentsModule } from './departments/departments.module';
import { PositionsModule } from './positions/positions.module';
import { ImportsModule } from './imports/imports.module';
import { AnalysisModule } from './analysis/analysis.module';
import { PayslipsModule } from './payslips/payslips.module';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    PrismaModule,
    EmployeesModule,
    PayrollModule,
    DepartmentsModule,
    PositionsModule,
    ImportsModule,
    AnalysisModule,
    PayslipsModule,
    PdfModule,
  ],
})
export class AppModule {}
