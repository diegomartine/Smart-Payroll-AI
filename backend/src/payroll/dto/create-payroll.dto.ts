import { IsDateString, IsString } from 'class-validator';

export class CreatePayrollDto {
  @IsString()
  period!: string;

  @IsDateString()
  startDate!: Date;

  @IsDateString()
  endDate!: Date;
}
