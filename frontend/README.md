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

### Employees / Positions / Departments

| Método | Ruta | Uso en el frontend |
|---|---|---|
| GET | `/employees` | Lista de empleados, selector para agregar a nómina |
| GET | `/employees/:id` | Detalle / precarga del formulario de edición |
| POST | `/employees` | Crear empleado |
| PATCH | `/employees/:id` | Editar empleado |
| DELETE | `/employees/:id` | Eliminar empleado |
| GET | `/positions` | Listado en la página "Cargos" |
| GET | `/positions/active` | Selector de cargo en el formulario de empleado |
| POST | `/positions` | Crear cargo |
| PATCH | `/positions/:id` | Editar nombre de un cargo |
| PATCH | `/positions/:id/deactivate` | Desactivar un cargo |
| GET | `/departments/active` | Selector de departamento en el formulario de empleado (solo lectura, ver nota abajo) |

### Payroll

| Método | Ruta | Uso en el frontend |
|---|---|---|
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
| GET | `/payroll/employees/:payrollEmployeeId/calculate` | Cálculo (devengado, deducciones, neto) por empleado |

### Imports / Analysis / Payslips / PDF (nuevo)

| Método | Ruta | Uso en el frontend |
|---|---|---|
| POST | `/imports/employees` | Página "Importar Excel" (multipart, campo `file`) |
| GET | `/analysis/payroll/:id` | Página "Análisis" y sección "Nómina más reciente" del Dashboard |
| GET | `/payslips/payroll-employee/:id` | Modal de desprendible individual |
| GET | `/payslips/payroll/:id` | (tipado/disponible; no se usa una vista dedicada — ver nota) |
| GET | `/pdf/payslip/:payrollEmployeeId` | Botón "Descargar PDF (plantilla estándar)" del desprendible |
| GET | `/pdf/payroll/:payrollId` | Botón "Descargar todos (PDF)" en el detalle de nómina y en el Dashboard |
| POST | `/pdf/payslip/:payrollEmployeeId/html` | Botón "Descargar con mi HTML" (plantilla personalizada, avanzado) |
| POST | `/pdf/payroll/:payrollId/html` | Disponible en `pdf.api.ts`; no se expuso botón en UI porque el backend usa el HTML tal cual (sin reemplazo de variables) para el PDF masivo, así que no hay forma de generarlo dinámicamente por empleado desde el frontend sin duplicar esa lógica |

## Endpoints que el backend NO tiene, o que no permiten cierta funcionalidad (documentado, no inventado)

1. **No hay un endpoint de resumen/estadísticas agregado para el Dashboard.**
   Los totales de empleados/nóminas se calculan en el cliente a partir de
   `GET /employees` y `GET /payroll` (conteos simples). El bloque "Nómina
   más reciente" (total, mayor pago, neto) sí usa datos reales, tomados de
   `GET /analysis/payroll/:id` sobre la nómina más reciente.

2. **No hay un endpoint que calcule el total agregado de toda una nómina
   de una sola vez.** Solo existe el cálculo por empleado
   (`GET /payroll/employees/:payrollEmployeeId/calculate`).
   `PayrollSummaryCard` llama ese endpoint una vez por empleado y **suma
   los resultados que ya calculó el backend** (no reimplementa la fórmula).

3. **No existe ningún endpoint para editar manualmente los campos de
   nómina de un `PayrollEmployee`** (`workedDays`, `overtimeHours`,
   `overtimeValue`, `bonus`, `transportAllowance`, `otherIncome`,
   `healthDeduction`, `pensionDeduction`, `otherDeductions`). `POST
   /payroll/:id/employees` solo acepta `{ employeeId }`. La única forma
   real de poblar esos campos es importando el Excel
   (`POST /imports/employees`), que hace `upsert` directo sobre
   `PayrollEmployee`. El frontend los muestra como solo lectura (en el
   recibo de cálculo y en el desprendible) y no inventó un formulario de
   edición para ellos.

4. **Los errores de importación son a nivel de archivo, no por fila.**
   `imports.service.ts` lanza `BadRequestException` con un solo mensaje
   (hoja faltante, columna faltante, período inconsistente, valor
   inválido) y aborta toda la transacción — no hay una lista de "fila 5:
   error X". La página de importación muestra ese único mensaje tal cual
   lo da el backend, sin inventar un desglose por fila.

5. **El PDF masivo con HTML personalizado no reemplaza variables por
   empleado.** `generatePayrollHtmlPdf` en `pdf.service.ts` usa el HTML
   recibido tal cual (`generatePdfFromHtml(html)`, sin pasar por
   `replaceTemplateVariables`), a diferencia del modo individual. Por eso
   no se ofreció un editor de plantilla HTML para el PDF masivo en la UI:
   no hay manera de que el backend lo interpole por empleado con la API
   actual.

6. **Departments no tiene página de administración en este frontend.**
   El backend expone el mismo CRUD que Positions
   (`GET/POST/PATCH /departments`, `PATCH /:id/deactivate`), pero esta
   integración solo pidió una página para "Positions". Departments se
   consume en modo lectura (`GET /departments/active`) para el selector
   del formulario de empleados. Si se necesita administrar Departments
   desde la UI, el backend ya lo soporta.

## Reglas del backend que el frontend respeta (sin duplicar la lógica)

- `validatePayrollEditable` en `payroll.service.ts` solo bloquea **agregar
  empleado** y **agregar/editar/eliminar novedad** cuando la nómina no está
  en `DRAFT`. El frontend deshabilita esos botones exactamente en esos
  casos (prop `canEdit` / `canModifyContent`).
- **Quitar un empleado** de la nómina y **editar/eliminar la nómina en sí**
  no tienen esa validación en el backend, así que el frontend tampoco los
  deshabilita por estado — si el backend llega a rechazar la operación, el
  mensaje real se muestra en un toast.
- Las transiciones de estado válidas se leen de
  `validPayrollStatusTransitions` en `src/utils/labels.ts`, que replica el
  mapa `validTransitions` de `payroll.service.ts` solo para pintar los
  botones correctos; la validación real siempre la hace el backend.
- El archivo de importación debe llamarse exactamente
  `nomina_YYYY-MM.xlsx` y traer las hojas `Employees`, `Payroll` y
  `Novelties` — el frontend no valida esto de antemano, solo muestra el
  error real si el backend lo rechaza.
- El análisis (`/analysis/payroll/:id`) es aritmética simple sobre los
  datos reales, **no un análisis de IA** — así se etiqueta en toda la UI
  ("Análisis de nómina", nunca "IA").

## Funcionalidades terminadas

- **Dashboard**: totales de empleados/nóminas, nóminas por estado, bloque
  de "nómina más reciente" (total, empleado mejor pagado, neto) usando
  `/analysis`, últimas nóminas, accesos rápidos (Importar Excel, Nueva
  nómina, Ver empleados, Ver análisis, Descargar nómina PDF).
- **Empleados**: listar, crear, ver, editar, eliminar, badges de estado,
  formulario con selectores reales de Cargo/Departamento (ya no texto
  libre) y validación.
- **Cargos (Positions)**: listar, crear, editar nombre, desactivar.
- **Nóminas**: listar, crear, ver, editar (periodo/fechas), eliminar,
  cambiar de estado.
- **Detalle de nómina**: empleados asociados (agregar/quitar), novedades
  por empleado (crear/editar/eliminar), cálculo por empleado en formato de
  recibo, resumen agregado de la nómina, descarga del PDF masivo, enlace a
  Análisis.
- **Desprendible de pago (Payslip)**: modal con información del empleado,
  nómina, devengados, deducciones, totales y novedades — más descarga en
  PDF (plantilla estándar o HTML personalizado con variables
  `{{employee.name}}`, `{{period}}`, etc., reemplazadas por el backend).
- **Importar Excel**: zona de arrastrar/seleccionar archivo, estado de
  carga, resultado real (empleados/registros de nómina/novedades
  importados) o el error real del backend.
- **Análisis de nómina**: selector de nómina, tarjetas (empleados, total,
  mayor pago, neto), factores que explican el mayor pago, texto de
  análisis, detalle por empleado.
- Manejo de errores HTTP (400/404/500/conexión, incluido el caso especial
  de errores en descargas PDF con `responseType: 'blob'`), loading states,
  empty states, confirmaciones antes de eliminar, mensajes de éxito/error,
  diseño responsive.

## Funcionalidades no implementadas (porque el backend no las soporta)

- Paginación o búsqueda server-side de empleados/nóminas.
- Historial de cambios de estado de una nómina.
- Autenticación / roles.
- Edición manual de los valores de nómina de un `PayrollEmployee`
  (solo se pueden poblar vía importación de Excel — ver punto 3 arriba).
- Errores de importación desglosados por fila (el backend solo da un
  mensaje general por archivo).
- Interpolación de variables por empleado en el PDF masivo con HTML
  personalizado (el backend no lo soporta en modo lote).
- Administración de Departments desde la UI (backend lo soporta, no se
  pidió para esta integración; ver punto 6 arriba).

## Sobre `npm run build`

Este proyecto se generó y revisó en un entorno sin acceso a red (no hay
forma de `npm install` ni de correr `npm run build` aquí), así que el build
no se pudo ejecutar en este entorno de trabajo. En su lugar se hizo una
revisión manual exhaustiva: cero usos de `any` en todo `src/`, todos los
imports relativos resueltos contra archivos reales, nombres exportados
verificados contra cada `import`, y cada componente que toca `Employee`
revisado para usar `employee.position.name` / `employee.department.name`
(ya no strings planos) tras el cambio de schema. Ejecuta
`npm install && npm run build` localmente — si aparece algún error de tipos
que se nos haya escapado, es un buen punto de partida para reportarlo.
