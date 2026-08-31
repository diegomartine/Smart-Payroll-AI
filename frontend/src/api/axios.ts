import axios from "axios";

/**
 * El backend (NestJS) no tiene CORS habilitado y no debe modificarse.
 * Por eso el frontend llama a "/api" y es el servidor de Vite
 * (ver vite.config.ts) el que reenvía esas peticiones a VITE_API_URL.
 * Así se respeta "no modificar backend" y aun así funciona `npm run dev`
 * sin bloqueos de CORS.
 */
const baseURL = import.meta.env.PROD ? import.meta.env.VITE_API_URL : "/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
