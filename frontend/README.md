# Smart Payroll AI — Frontend

Frontend de **Smart Payroll AI**, una aplicación web para la gestión y análisis de nómina.

Está desarrollado con **React, Vite y TypeScript** y consume la API REST del backend desarrollado con **NestJS, Prisma y PostgreSQL**.

## Tecnologías

- React
- TypeScript
- Vite
- Axios
- React Router
- CSS
- NestJS API
- Prisma
- PostgreSQL

## Requisitos

- Node.js
- npm
- Backend de Smart Payroll AI ejecutándose localmente

## Instalación y ejecución

Desde la raíz del proyecto:

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible normalmente en:

```text
http://localhost:5173
```

El backend debe estar ejecutándose en:

```text
http://localhost:3000
```

Para iniciar el backend:

```bash
cd backend
npm install
npm run start:dev
```

## Configuración de la API

El frontend utiliza rutas bajo `/api` para comunicarse con el backend durante el desarrollo.

La URL del backend se configura mediante la variable:

```env
VITE_API_URL=http://localhost:3000
```

El archivo `vite.config.ts` configura el proxy de desarrollo para reenviar las solicitudes `/api` hacia el backend.

Este mecanismo permite que el frontend pueda consumir la API sin modificar la configuración CORS del backend.

Para un despliegue en producción, el servidor donde se aloje el frontend debe proporcionar una configuración equivalente o utilizar una arquitectura que permita la comunicación directa con la API.

## Funcionalidades

### Dashboard

- Resumen de empleados.
- Resumen de nóminas.
- Nóminas agrupadas por estado.
- Información de la nómina más reciente.
- Empleado con mayor pago.
- Accesos rápidos a las principales funcionalidades.
- Descarga de nómina en PDF.

### Empleados

- Listado de empleados.
- Creación de empleados.
- Consulta de información.
- Edición.
- Eliminación.
- Estado del empleado.
- Selección de cargo.
- Selección de departamento.
- Validación de formularios.

### Cargos

- Listado de cargos.
- Creación de cargos.
- Edición de cargos.
- Desactivación de cargos.
- Selección de cargos activos desde el formulario de empleados.

### Departamentos

- Listado de departamentos.
- Creación de departamentos.
- Edición de departamentos.
- Desactivación de departamentos.
- Selección de departamentos activos desde el formulario de empleados.
- Creación de un nuevo departamento directamente desde el formulario de empleados.

### Nóminas

- Listado de nóminas.
- Creación de nóminas.
- Edición del periodo y fechas.
- Eliminación.
- Cambio de estado.
- Consulta del detalle de una nómina.
- Asociación de empleados.
- Retiro de empleados.

### Novedades de nómina

- Creación de novedades.
- Edición de novedades.
- Eliminación de novedades.
- Consulta de novedades por empleado y nómina.

### Cálculo de nómina

El frontend consume el cálculo realizado por el backend para mostrar:

- Devengados.
- Deducciones.
- Salario neto.
- Horas extras.
- Bonificaciones.
- Auxilio de transporte.
- Otros ingresos.
- Salud.
- Pensión.
- Otras deducciones.

El frontend no replica la fórmula de cálculo; utiliza los resultados proporcionados por la API.

### Importación de Excel

Permite cargar información de nómina mediante un archivo Excel.

El archivo debe cumplir con la estructura esperada por el backend:

```text
nomina_YYYY-MM.xlsx
```

Y contener las hojas:

```text
Employees
Payroll
Novelties
```

La interfaz muestra el resultado real de la importación o el mensaje de error proporcionado por el backend.

### Análisis de nómina

Permite seleccionar una nómina y consultar:

- Número de empleados.
- Total de la nómina.
- Mayor pago.
- Neto total.
- Factores asociados al mayor pago.
- Detalle por empleado.

El análisis actualmente corresponde a cálculos realizados sobre los datos reales de la nómina. No se presenta como análisis mediante inteligencia artificial.

### Desprendibles de pago

Permite consultar el desprendible individual de cada empleado con:

- Información del empleado.
- Periodo de nómina.
- Devengados.
- Deducciones.
- Total neto.
- Novedades.

También permite descargar el desprendible en PDF.

### Generación de PDF

El frontend permite:

- Descargar el desprendible individual en PDF.
- Descargar todos los desprendibles de una nómina.
- Generar un PDF individual utilizando una plantilla HTML personalizada.

Las variables de las plantillas individuales pueden incluir valores como:

```text
{{employee.name}}
{{period}}
```

Estas variables son procesadas por el backend.

## Endpoints utilizados

### Employees

| Método | Endpoint         | Descripción        |
| ------ | ---------------- | ------------------ |
| GET    | `/employees`     | Listar empleados   |
| GET    | `/employees/:id` | Consultar empleado |
| POST   | `/employees`     | Crear empleado     |
| PATCH  | `/employees/:id` | Editar empleado    |
| DELETE | `/employees/:id` | Eliminar empleado  |

### Positions

| Método | Endpoint                    | Descripción           |
| ------ | --------------------------- | --------------------- |
| GET    | `/positions`                | Listar cargos         |
| GET    | `/positions/active`         | Listar cargos activos |
| POST   | `/positions`                | Crear cargo           |
| PATCH  | `/positions/:id`            | Editar cargo          |
| PATCH  | `/positions/:id/deactivate` | Desactivar cargo      |

### Departments

| Método | Endpoint                      | Descripción                  |
| ------ | ----------------------------- | ---------------------------- |
| GET    | `/departments`                | Listar departamentos         |
| GET    | `/departments/active`         | Listar departamentos activos |
| POST   | `/departments`                | Crear departamento           |
| PATCH  | `/departments/:id`            | Editar departamento          |
| PATCH  | `/departments/:id/deactivate` | Desactivar departamento      |

### Payroll

| Método | Endpoint                                          | Descripción                    |
| ------ | ------------------------------------------------- | ------------------------------ |
| GET    | `/payroll`                                        | Listar nóminas                 |
| GET    | `/payroll/:id`                                    | Consultar nómina               |
| POST   | `/payroll`                                        | Crear nómina                   |
| PATCH  | `/payroll/:id`                                    | Editar nómina                  |
| DELETE | `/payroll/:id`                                    | Eliminar nómina                |
| PATCH  | `/payroll/:id/status`                             | Cambiar estado                 |
| GET    | `/payroll/:id/employees`                          | Listar empleados de una nómina |
| POST   | `/payroll/:id/employees`                          | Agregar empleado               |
| DELETE | `/payroll/:id/employees/:employeeId`              | Retirar empleado               |
| GET    | `/payroll/:id/employees/:employeeId/novelties`    | Consultar novedades            |
| POST   | `/payroll/:id/employees/:employeeId/novelties`    | Crear novedad                  |
| PATCH  | `/payroll/novelties/:noveltyId`                   | Editar novedad                 |
| DELETE | `/payroll/novelties/:noveltyId`                   | Eliminar novedad               |
| GET    | `/payroll/employees/:payrollEmployeeId/calculate` | Calcular nómina del empleado   |

### Imports

| Método | Endpoint             | Descripción                                      |
| ------ | -------------------- | ------------------------------------------------ |
| POST   | `/imports/employees` | Importar empleados y datos de nómina desde Excel |

### Analysis

| Método | Endpoint                | Descripción         |
| ------ | ----------------------- | ------------------- |
| GET    | `/analysis/payroll/:id` | Analizar una nómina |

### Payslips

| Método | Endpoint                         | Descripción                           |
| ------ | -------------------------------- | ------------------------------------- |
| GET    | `/payslips/payroll-employee/:id` | Consultar desprendible individual     |
| GET    | `/payslips/payroll/:id`          | Consultar desprendibles de una nómina |

### PDF

| Método | Endpoint                               | Descripción                       |
| ------ | -------------------------------------- | --------------------------------- |
| GET    | `/pdf/payslip/:payrollEmployeeId`      | Descargar desprendible individual |
| GET    | `/pdf/payroll/:payrollId`              | Descargar todos los desprendibles |
| POST   | `/pdf/payslip/:payrollEmployeeId/html` | Generar PDF individual desde HTML |
| POST   | `/pdf/payroll/:payrollId/html`         | Generar PDF masivo desde HTML     |

## Reglas de negocio respetadas

El frontend respeta las reglas de negocio implementadas en el backend.

Entre ellas:

- Las novedades solo pueden modificarse cuando la nómina está en estado `DRAFT`.
- Los empleados solo pueden agregarse a una nómina editable.
- Las transiciones de estado de la nómina son validadas por el backend.
- El frontend utiliza las reglas disponibles para mostrar u ocultar las acciones correspondientes.
- La validación definitiva siempre corresponde al backend.
- Los valores calculados de nómina son proporcionados por la API.
- Los datos importados desde Excel son procesados por el backend.

## Limitaciones actuales

Las siguientes funcionalidades no están implementadas porque no forman parte de las capacidades actuales de la API:

- Autenticación.
- Roles y permisos.
- Paginación server-side.
- Búsqueda server-side.
- Historial de cambios de estado.
- Edición manual de los valores calculados de `PayrollEmployee`.
- Desglose de errores de importación por fila.
- Interpolación de variables por empleado en PDFs masivos mediante HTML personalizado.

## Estructura principal

```text
frontend/
├── public/
├── src/
│   ├── api/
│   ├── components/
│   │   ├── departments/
│   │   ├── layout/
│   │   └── ...
│   ├── pages/
│   │   ├── departments/
│   │   ├── employees/
│   │   ├── payroll/
│   │   └── ...
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env
├── vite.config.ts
├── package.json
└── README.md
```

## Construcción para producción

Para generar la versión de producción:

```bash
npm install
npm run build
```

Los archivos generados se encontrarán en:

```text
dist/
```

Para realizar una prueba local de la versión de producción:

```bash
npm run preview
```

## Estado del proyecto

El frontend cuenta actualmente con los módulos principales para la gestión de empleados, cargos, departamentos, nóminas, novedades, importación de Excel, análisis de nómina, desprendibles de pago y generación de documentos PDF.

El frontend está diseñado para consumir la API REST proporcionada por el backend de **Smart Payroll AI**.
