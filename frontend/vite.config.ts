import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// El backend de Smart-Payroll-AI (NestJS) no tiene CORS habilitado y no
// debe modificarse. Para poder consumir la API en desarrollo sin bloqueos
// de CORS, el frontend llama a rutas relativas bajo "/api" y Vite las
// reenvía (proxy) al backend real definido en VITE_API_URL. En producción,
// el servidor donde se despliegue el build debe aplicar el mismo proxy
// (o el backend deberá habilitar CORS; ver README del frontend).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_URL || 'http://localhost:3000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
