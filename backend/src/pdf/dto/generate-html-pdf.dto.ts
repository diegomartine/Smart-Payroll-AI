import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateHtmlPdfDto {
  @IsString()
  @IsNotEmpty()
  html: string;
}
