import { IsInt } from 'class-validator';

export class AddEmployeeToPayrollDto {
  @IsInt()
  employeeId!: number;
}
