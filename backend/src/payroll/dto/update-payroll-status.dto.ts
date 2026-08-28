import { ApiProperty } from '@nestjs/swagger';
import { PayrollStatus } from '../../../generated/prisma/client';

export class UpdatePayrollStatusDto {
  @ApiProperty({
    enum: PayrollStatus,
    example: PayrollStatus.PROCESSING,
  })
  status!: PayrollStatus;
}
