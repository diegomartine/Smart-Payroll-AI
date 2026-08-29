import { Controller, Get, Param } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('payroll/:id')
  analyzePayroll(@Param('id') id: string) {
    return this.analysisService.analyzePayroll(Number(id));
  }
}
