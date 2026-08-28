import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PayrollNoveltyType } from '../../../generated/prisma/enums';

export class CreatePayrollNoveltyDto {
  @IsEnum(PayrollNoveltyType)
  type!: PayrollNoveltyType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsNumber()
  amount!: number;
}
