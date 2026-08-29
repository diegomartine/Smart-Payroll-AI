# Smart Payroll AI — Frontend

Frontend de **Smart-Payroll-AI**, construido con React + Vite + TypeScript,
que consume la API REST del `backend/` (NestJS + Prisma + PostgreSQL) sin
modificarlo.

## Ejecutar en local

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. Asegúrate de que el backend esté corriendo en
`http://localhost:3000` (`cd backend && npm run start:dev`).

## Por qué se usa un proxy (`/api`) en vez de llamar directo a `localhost:3000`

El backend (`src/main.ts`) **no tiene CORS habilitado** y la instrucción del
proyecto es no modificarlo. Si el frontend llamara directo a
`http://localhost:3000` desde `http://localhost:5173`, el navegador
bloquearía las peticiones por CORS.

Solución sin tocar el backend: el frontend llama a rutas relativas bajo
`/api`, y `vite.config.ts` las reenvía (proxy) al backend real, definido en
`VITE_API_URL` (`.env`). Como el proxy corre del lado del servidor de Vite,
el navegador nunca hace una petición cross-origin real.

Si en algún momento se despliega el frontend fuera de `vite dev` (por
ejemplo `vite preview` o un hosting estático), hay que reproducir ese mismo
proxy en el servidor de destino, o habilitar CORS en el backend.

## Endpoints del backend utilizados

| Método | Ruta | Uso en el frontend |
|---|---|---|
| GET | `/employees` | Lista de empleados, selector para agregar a nómina |
| GET | `/employees/:id` | Detalle / precarga del formulario de edición |
| POST | `/employees` | Crear empleado |
| PATCH | `/employees/:id` | Editar empleado |
| DELETE | `/employees/:id` | Eliminar empleado |
| GET | `/payroll` | Lista de nóminas, dashboard |
| GET | `/payroll/:id` | Detalle de nómina |
| POST | `/payroll` | Crear nómina |
| PATCH | `/payroll/:id` | Editar periodo/fechas de una nómina |
| DELETE | `/payroll/:id` | Eliminar nómina |
| PATCH | `/payroll/:id/status` | Cambiar estado (DRAFT → PROCESSING → COMPLETED, o CANCELLED) |
| GET | `/payroll/:id/employees` | Empleados asignados a la nómina |
| POST | `/payroll/:id/employees` | Agregar empleado a la nómina |
| DELETE | `/payroll/:id/employees/:employeeId` | Quitar empleado de la nómina |
| GET | `/payroll/:id/employees/:employeeId/novelties` | Novedades del empleado en esa nómina |
| POST | `/payroll/:id/employees/:employeeId/novelties` | Crear novedad |
| PATCH | `/payroll/novelties/:noveltyId` | Editar novedad |
| DELETE | `/payroll/novelties/:noveltyId` | Eliminar novedad |
| GET | `/payroll/employees/:payrollEmployeeId/calculate` | Cálculo (salario base, devengado, deducciones, neto) por empleado |

## Endpoints que el backend NO tiene (documentado, no inventado)

1. **No hay un endpoint de resumen/estadísticas para el Dashboard.**
   Los totales (empleados, nóminas, nóminas por estado) se calculan en el
   cliente a partir de `GET /employees` y `GET /payroll`, sin lógica de
   negocio: solo conteos (`.length`, `.filter`).

2. **No hay un endpoint que calcule el total agregado de toda una nómina.**
   Solo existe `GET /payroll/employees/:payrollEmployeeId/calculate`, por
   empleado. `PayrollSummaryCard` llama ese endpoint una vez por cada
   empleado de la nómina y **suma los resultados que ya calculó el
   backend** (no reimplementa la fórmula de nómina).

## Reglas del backend que el frontend respeta (sin duplicar la lógica)

- `validatePayrollEditable` en `payroll.service.ts` solo bloquea **agregar
  empleado**, **agregar/editar/eliminar novedad** cuando la nómina no está
  en `DRAFT`. El frontend deshabilita esos botones exactamente en esos
  casos (prop `canEdit` / `canModifyContent`).
- **Quitar un empleado** de la nómina y **editar/eliminar la nómina en sí**
  no tienen esa validación en el backend (no hay chequeo de estado en esos
  métodos del servicio), así que el frontend tampoco los deshabilita por
  estado — si el backend llega a rechazar la operación, el mensaje de
  error real del backend se muestra en un toast.
- Las transiciones de estado válidas (`DRAFT → PROCESSING/CANCELLED`,
  `PROCESSING → COMPLETED`, `COMPLETED`/`CANCELLED` sin salida) se leen de
  `validPayrollStatusTransitions` en `src/utils/labels.ts`, que replica
  exactamente el mapa `validTransitions` de `payroll.service.ts` — es una
  copia para pintar los botones correctos en la UI, la validación real
  siempre la hace el backend.

## Funcionalidades terminadas

- **Dashboard**: total de empleados, total de nóminas, nóminas por estado
  (DRAFT/PROCESSING/COMPLETED), últimas nóminas, accesos rápidos.
- **Empleados**: listar, crear, ver, editar, eliminar (con confirmación),
  badges de estado (ACTIVE/INACTIVE/SUSPENDED), formularios con
  validación.
- **Nóminas**: listar, crear, ver, editar (periodo/fechas), eliminar,
  cambiar de estado con los botones habilitados según transición válida.
- **Detalle de nómina**: empleados asociados (agregar/quitar), novedades
  por empleado (crear/editar/eliminar), cálculo por empleado en formato de
  recibo ("Salario base", "Total devengado", "Deducciones", "Total neto"),
  resumen agregado de toda la nómina.
- Manejo de errores HTTP (400/404/500/conexión) mostrando el mensaje real
  del backend en un toast.
- Loading states, empty states, confirmaciones antes de eliminar,
  mensajes de éxito/error, diseño responsive (sidebar colapsable en
  móvil).

## Funcionalidades no implementadas (porque el backend no las soporta)

- Paginación o búsqueda server-side de empleados/nóminas (los endpoints
  `GET /employees` y `GET /payroll` no aceptan query params de filtro).
- Historial de cambios de estado de una nómina (el backend no lo expone).
- Autenticación / roles (no hay endpoints de auth en el backend).
- Importación de empleados desde Excel (no existe endpoint para esto).
