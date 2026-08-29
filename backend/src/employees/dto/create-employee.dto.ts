import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

import {
  DocumentType,
  EmploymentStatus,
} from '../../../generated/prisma/enums';

export class CreateEmployeeDto {
  @IsString()
  employeeCode!: string;

  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @IsString()
  documentNumber!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNumber()
  @IsPositive()
  departmentId!: number;

  @IsNumber()
  @IsPositive()
  positionId!: number;

  @IsNumber()
  @IsPositive()
  baseSalary!: number;

  @IsDateString()
  hireDate!: Date;

  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;
}
