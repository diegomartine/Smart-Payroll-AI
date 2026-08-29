/** Forma del error que devuelve el backend NestJS (ExceptionFilter por defecto). */
export interface ApiErrorPayload {
  message: string | string[];
  error?: string;
  statusCode: number;
}
