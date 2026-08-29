import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import puppeteer from 'puppeteer';
import { PayslipsService } from '../payslips/payslips.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PdfService {
  constructor(
    private readonly payslipsService: PayslipsService,
    private readonly prisma: PrismaService,
  ) {}

  /*
   * ==========================================
   * PDF INDIVIDUAL
   * ==========================================
   */

  async generatePayslipPdf(
    payrollEmployeeId: number,
    template?: PayslipTemplate,
  ): Promise<Buffer> {
    const payslip = await this.payslipsService.getPayslip(payrollEmployeeId);

    const selectedTemplate = template ?? this.getDefaultTemplate();

    return this.createPdf([payslip], selectedTemplate);
  }

  /*
   * ==========================================
   * PDF COMPLETO DE UNA NÓMINA
   * ==========================================
   *
   * Un empleado = una página.
   */

  async generatePayrollPdf(
    payrollId: number,
    template?: PayslipTemplate,
  ): Promise<Buffer> {
    const payrollEmployees = await this.prismaPayrollEmployees(payrollId);

    if (payrollEmployees.length === 0) {
      throw new Error(`La nómina ${payrollId} no tiene empleados`);
    }

    const payslips: any[] = [];

    for (const payrollEmployee of payrollEmployees) {
      const payslip = await this.payslipsService.getPayslip(payrollEmployee.id);

      payslips.push(payslip);
    }

    const selectedTemplate = template ?? this.getDefaultTemplate();

    return this.createPdf(payslips, selectedTemplate);
  }
  /*
   * ==========================================
   * PDF HTML INDIVIDUAL
   * ==========================================
   *
   * El frontend envía el HTML completo
   * con su diseño, estilos y estructura.
   */

  async generatePayslipHtmlPdf(
    payrollEmployeeId: number,
    html: string,
  ): Promise<Buffer> {
    const payslip = await this.payslipsService.getPayslip(payrollEmployeeId);

    const processedHtml = this.replaceTemplateVariables(html, payslip);

    return this.generatePdfFromHtml(processedHtml);
  }

  /*
   * ==========================================
   * PDF HTML COMPLETO DE UNA NÓMINA
   * ==========================================
   *
   * El HTML enviado por el frontend puede
   * contener todos los desprendibles.
   *
   * Puppeteer lo convierte en un único PDF.
   */

  async generatePayrollHtmlPdf(
    payrollId: number,
    html: string,
  ): Promise<Buffer> {
    const payrollEmployees = await this.prismaPayrollEmployees(payrollId);

    if (payrollEmployees.length === 0) {
      throw new NotFoundException(`La nómina ${payrollId} no tiene empleados`);
    }

    return this.generatePdfFromHtml(html);
  }

  private replaceTemplateVariables(html: string, data: any): string {
    return html.replace(/{{\s*([^}]+)\s*}}/g, (_match, key: string) => {
      const value = this.resolveValue(data, key.trim());

      if (value === null || value === undefined) {
        return '';
      }

      if (typeof value === 'number') {
        return this.formatCurrency(value);
      }

      return String(value);
    });
  }

  /*
   * ==========================================
   * HTML → PDF
   * ==========================================
   */

  private async generatePdfFromHtml(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
    });

    try {
      const page = await browser.newPage();

      await page.setContent(html, {
        waitUntil: 'load',
      });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  /*
   * ==========================================
   * OBTENER EMPLEADOS DE LA NÓMINA
   * ==========================================
   */

  private async prismaPayrollEmployees(
    payrollId: number,
  ): Promise<{ id: number }[]> {
    const payroll = await this.prisma.payroll.findUnique({
      where: {
        id: payrollId,
      },
      include: {
        employees: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${payrollId} not found`);
    }

    return payroll.employees;
  }

  /*
   * ==========================================
   * GENERADOR DEL PDF
   * ==========================================
   */

  private createPdf(
    payslips: any[],
    template: PayslipTemplate,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on('error', reject);

      payslips.forEach((payslip, index) => {
        if (index > 0) {
          doc.addPage();
        }

        this.renderPayslip(doc, payslip, template);
      });

      doc.end();
    });
  }

  /*
   * ==========================================
   * RENDERIZAR UN DESPRENDIBLE
   * ==========================================
   */

  private renderPayslip(
    doc: PDFKit.PDFDocument,
    payslip: any,
    template: PayslipTemplate,
  ) {
    doc.fontSize(18).font('Helvetica-Bold').text(template.title, {
      align: 'center',
    });

    doc.moveDown(0.5);

    doc.fontSize(10).font('Helvetica').text(`Período: ${payslip.period}`, {
      align: 'center',
    });

    doc.moveDown();

    for (const section of template.sections) {
      doc.fontSize(12).font('Helvetica-Bold').text(section.title);

      doc.moveDown(0.3);

      for (const field of section.fields) {
        const value = this.resolveValue(payslip, field.key);

        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`${field.label}: ${this.formatValue(value)}`);
      }

      doc.moveDown();
    }

    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(`NETO A PAGAR: ${this.formatCurrency(payslip.netPay)}`, {
        align: 'right',
      });
  }

  /*
   * ==========================================
   * RESOLVER DE CAMPOS
   * ==========================================
   */

  private resolveValue(data: any, key: string): any {
    const parts = key.split('.');

    let value = data;

    for (const part of parts) {
      if (value === null || value === undefined) {
        return null;
      }

      value = value[part];
    }

    return value;
  }

  /*
   * ==========================================
   * FORMATEADORES
   * ==========================================
   */

  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '-';
    }

    if (typeof value === 'number') {
      return this.formatCurrency(value);
    }

    return String(value);
  }

  private formatCurrency(value: number): string {
    return `$${Number(value).toLocaleString('es-CO')}`;
  }

  /*
   * ==========================================
   * TEMPLATE POR DEFECTO
   * ==========================================
   */

  private getDefaultTemplate(): PayslipTemplate {
    return {
      title: 'DESPRENDIBLE DE NÓMINA',

      sections: [
        {
          title: 'INFORMACIÓN DEL EMPLEADO',

          fields: [
            {
              label: 'Empleado',
              key: 'employee.name',
            },
            {
              label: 'Código',
              key: 'employee.employeeCode',
            },
            {
              label: 'Documento',
              key: 'employee.documentNumber',
            },
            {
              label: 'Cargo',
              key: 'employee.position',
            },
            {
              label: 'Departamento',
              key: 'employee.department',
            },
          ],
        },

        {
          title: 'NÓMINA',

          fields: [
            {
              label: 'Días trabajados',
              key: 'payroll.workedDays',
            },
            {
              label: 'Salario base',
              key: 'earnings.baseSalary',
            },
            {
              label: 'Horas extra',
              key: 'payroll.overtimeHours',
            },
          ],
        },

        {
          title: 'DEVENGADOS',

          fields: [
            {
              label: 'Salario base',
              key: 'earnings.baseSalary',
            },
            {
              label: 'Horas extra',
              key: 'earnings.overtimeValue',
            },
            {
              label: 'Bonificaciones',
              key: 'earnings.bonus',
            },
            {
              label: 'Auxilio de transporte',
              key: 'earnings.transportAllowance',
            },
            {
              label: 'Otros ingresos',
              key: 'earnings.otherIncome',
            },
            {
              label: 'Novedades',
              key: 'earnings.noveltyEarnings',
            },
          ],
        },

        {
          title: 'DEDUCCIONES',

          fields: [
            {
              label: 'Salud',
              key: 'deductions.healthDeduction',
            },
            {
              label: 'Pensión',
              key: 'deductions.pensionDeduction',
            },
            {
              label: 'Otras deducciones',
              key: 'deductions.otherDeductions',
            },
            {
              label: 'Novedades',
              key: 'deductions.noveltyDeductions',
            },
          ],
        },

        {
          title: 'TOTALES',

          fields: [
            {
              label: 'Total devengado',
              key: 'totalEarnings',
            },
            {
              label: 'Total deducciones',
              key: 'totalDeductions',
            },
            {
              label: 'Neto a pagar',
              key: 'netPay',
            },
          ],
        },
      ],
    };
  }
}

interface PayslipTemplate {
  title: string;
  sections: PayslipSection[];
}

interface PayslipSection {
  title: string;
  fields: PayslipField[];
}

interface PayslipField {
  label: string;
  key: string;
}
