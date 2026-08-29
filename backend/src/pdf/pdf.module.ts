import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { PayslipsModule } from '../payslips/payslips.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PayslipsModule, PrismaModule],
  controllers: [PdfController],
  providers: [PdfService],
})
export class PdfModule {}
