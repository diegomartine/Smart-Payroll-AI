import { isAxiosError } from 'axios';
import type { ApiErrorPayload } from '../types/common.types';

/**
 * El backend devuelve errores con la forma:
 * { "message": "...", "error": "Bad Request", "statusCode": 400 }
 * (o `message` como array cuando class-validator rechaza varios campos).
 * Esta función extrae siempre un texto legible para mostrar al usuario.
 */
export function getErrorMessage(err: unknown): string {
  if (isAxiosError<ApiErrorPayload>(err)) {
    if (!err.response) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en el puerto 3000.';
    }

    const data = err.response.data;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(' · ') : data.message;
    }

    if (err.response.status === 404) return 'El recurso solicitado no existe.';
    if (err.response.status >= 500) return 'Ocurrió un error en el servidor. Intenta de nuevo.';
    return 'Ocurrió un error al procesar la solicitud.';
  }

  return 'Ocurrió un error inesperado.';
}
