import { PartialType } from '@nestjs/mapped-types';
import { CreatePayrollNoveltyDto } from './create-payroll-novelty.dto';

export class UpdatePayrollNoveltyDto extends PartialType(
  CreatePayrollNoveltyDto,
) {}
