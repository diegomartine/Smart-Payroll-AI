import { Controller, Get, Param, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { GenerateHtmlPdfDto } from './dto/generate-html-pdf.dto';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('payslip/:payrollEmployeeId')
  async getPayslipPdf(
    @Param('payrollEmployeeId') payrollEmployeeId: string,
    @Res() res: Response,
  ) {
    const pdf = await this.pdfService.generatePayslipPdf(
      Number(payrollEmployeeId),
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="desprendible-${payrollEmployeeId}.pdf"`,
      'Content-Length': pdf.length,
    });

    res.end(pdf);
  }

  @Get('payroll/:payrollId')
  async getPayrollPdf(
    @Param('payrollId') payrollId: string,
    @Res() res: Response,
  ) {
    const pdf = await this.pdfService.generatePayrollPdf(Number(payrollId));

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="nomina-${payrollId}-desprendibles.pdf"`,
      'Content-Length': pdf.length,
    });

    res.end(pdf);
  }

  @Post('payslip/:payrollEmployeeId/html')
  async getPayslipHtmlPdf(
    @Param('payrollEmployeeId') payrollEmployeeId: string,
    @Body() dto: GenerateHtmlPdfDto,
    @Res() res: Response,
  ) {
    const pdf = await this.pdfService.generatePayslipHtmlPdf(
      Number(payrollEmployeeId),
      dto.html,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="desprendible-${payrollEmployeeId}.pdf"`,
      'Content-Length': pdf.length,
    });

    res.end(pdf);
  }

  @Post('payroll/:payrollId/html')
  async getPayrollHtmlPdf(
    @Param('payrollId') payrollId: string,
    @Body() dto: GenerateHtmlPdfDto,
    @Res() res: Response,
  ) {
    const pdf = await this.pdfService.generatePayrollHtmlPdf(
      Number(payrollId),
      dto.html,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="nomina-${payrollId}-desprendibles.pdf"`,
      'Content-Length': pdf.length,
    });

    res.end(pdf);
  }
}
