/**
 * Dispara la descarga de un Blob ya recibido del backend (por ejemplo un
 * PDF) creando un enlace temporal. No genera ni transforma el archivo:
 * solo lo entrega al navegador tal como llegó.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Extrae el nombre de archivo de un header Content-Disposition tipo
 * `attachment; filename="desprendible-3.pdf"`. Si no está presente o no
 * se puede parsear, devuelve el fallback dado.
 */
export function filenameFromContentDisposition(
  header: string | undefined,
  fallback: string,
): string {
  if (!header) return fallback;
  const match = header.match(/filename="?([^";]+)"?/i);
  return match ? match[1] : fallback;
}
