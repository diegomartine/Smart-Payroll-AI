import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
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

  @IsString()
  position!: string;

  @IsString()
  department!: string;

  @IsNumber()
  baseSalary!: number;

  @IsDateString()
  hireDate!: Date;

  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;
}
