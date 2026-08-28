# Smart-Payroll-AI — Backend

Backend REST para la gestión y procesamiento de nómina de empleados, desarrollado con **NestJS**, **Prisma ORM** y **PostgreSQL**.

El backend proporciona una API para administrar empleados, crear períodos de nómina, asociar empleados, registrar novedades y calcular los valores de nómina por empleado.

---

## 🚀 Tecnologías

* **Node.js**
* **NestJS**
* **TypeScript**
* **Prisma ORM**
* **PostgreSQL**
* **Swagger / OpenAPI**
* **ESLint**
* **Prettier**

---

## 📋 Funcionalidades

### 👨‍💼 Gestión de empleados

El módulo `Employees` permite:

* Crear empleados.
* Consultar empleados.
* Consultar un empleado por ID.
* Actualizar información de un empleado.
* Eliminar empleados.
* Manejar estados laborales:

  * `ACTIVE`
  * `INACTIVE`
  * `SUSPENDED`
* Manejar diferentes tipos de documento:

  * `CC`
  * `CE`
  * `PASSPORT`
  * `NIT`

Cada empleado contiene información como:

* Código de empleado.
* Documento.
* Nombre y apellido.
* Correo electrónico.
* Teléfono.
* Cargo.
* Departamento.
* Salario base.
* Fecha de contratación.
* Estado laboral.

---

# 💰 Gestión de nómina

El módulo `Payroll` permite administrar períodos de nómina.

### Funcionalidades

* Crear nóminas.
* Consultar todas las nóminas.
* Consultar una nómina por ID.
* Actualizar una nómina.
* Eliminar una nómina.
* Cambiar el estado de una nómina.
* Asociar empleados a una nómina.
* Eliminar empleados de una nómina.
* Consultar empleados asociados.
* Registrar novedades.
* Actualizar novedades.
* Eliminar novedades.
* Calcular la nómina de un empleado.

---

## 📊 Estados de nómina

Las nóminas utilizan los siguientes estados:

| Estado       | Descripción                                 |
| ------------ | ------------------------------------------- |
| `DRAFT`      | Nómina en preparación y editable.           |
| `PROCESSING` | Nómina en proceso de cálculo/procesamiento. |
| `COMPLETED`  | Nómina finalizada.                          |
| `CANCELLED`  | Nómina cancelada.                           |

El backend aplica reglas de negocio para impedir modificaciones cuando una nómina se encuentra en un estado que no permite cambios.

Por ejemplo:

```json
{
  "message": "Payroll with ID 1 cannot be modified because its status is PROCESSING",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

# 👥 Empleados asociados a una nómina

La relación entre empleados y nóminas se maneja mediante `PayrollEmployee`.

Esto permite que un empleado pueda participar en diferentes períodos de nómina.

La relación utiliza una restricción única:

```text
payrollId + employeeId
```

Esto evita asociar dos veces el mismo empleado a la misma nómina.

Ejemplo:

```json
{
  "id": 3,
  "payrollId": 4,
  "employeeId": 1,
  "createdAt": "2026-08-28T21:01:10.489Z"
}
```

---

# 📝 Novedades de nómina

Cada empleado asociado a una nómina puede tener diferentes novedades.

Los tipos disponibles son:

```text
OVERTIME
BONUS
COMMISSION
ALLOWANCE
DEDUCTION
ABSENCE
SICK_LEAVE
VACATION
OTHER_EARNING
OTHER_DEDUCTION
```

### Ejemplos

**Hora extra:**

```json
{
  "type": "OVERTIME",
  "description": "Horas extras",
  "quantity": 10,
  "amount": 218750
}
```

**Deducción:**

```json
{
  "type": "DEDUCTION",
  "description": "Descuento de prueba",
  "quantity": 1,
  "amount": 100000
}
```

Las novedades pueden:

* Crearse.
* Consultarse.
* Actualizarse.
* Eliminarse.

También están sujetas a las reglas de modificación de la nómina a la que pertenecen.

---

# 🧮 Cálculo de nómina

El backend dispone de un endpoint para calcular la nómina correspondiente a un empleado dentro de un período.

El cálculo considera:

```text
Salario base
     +
Devengados
     -
Deducciones
     =
Neto a pagar
```

Ejemplo de respuesta:

```json
{
  "payrollEmployeeId": 2,
  "employee": {
    "id": 1,
    "employeeCode": "EMP001",
    "name": "Diego Martinez"
  },
  "baseSalary": "3500000",
  "totalEarnings": "3718750",
  "totalDeductions": "0",
  "netPay": "3718750"
}
```

Los valores monetarios utilizan `Decimal` mediante Prisma para evitar problemas de precisión propios de los valores `number` en JavaScript/TypeScript.

---

# 🗄️ Modelo de datos

La estructura principal de datos es:

```text
Employee
    │
    │
    ▼
PayrollEmployee
    ▲
    │
    │
Payroll
    │
    │
    ▼
PayrollNovelty
```

### Employee

Representa a los empleados de la empresa.

### Payroll

Representa un período de nómina.

### PayrollEmployee

Representa la asociación entre un empleado y una nómina.

### PayrollNovelty

Representa ingresos, deducciones u otras novedades aplicadas a un empleado dentro de una nómina.

---

# 🔗 API

La API está organizada bajo los siguientes recursos principales:

```text
/employees
/payroll
/payroll/novelties
```

## Employees

Operaciones principales:

```text
GET    /employees
GET    /employees/:id
POST   /employees
PATCH  /employees/:id
DELETE /employees/:id
```

---

## Payroll

Operaciones principales:

```text
GET    /payroll
GET    /payroll/:id
POST   /payroll
PATCH  /payroll/:id
DELETE /payroll/:id
```

Cambio de estado:

```text
PATCH /payroll/:id/status
```

Asociación de empleados:

```text
POST   /payroll/:payrollId/employees
GET    /payroll/:payrollId/employees
DELETE /payroll/:payrollId/employees/:employeeId
```

Novedades:

```text
POST   /payroll/:payrollId/employees/:employeeId/novelties
GET    /payroll/novelties/:id
PATCH  /payroll/novelties/:id
DELETE /payroll/novelties/:id
```

Cálculo:

```text
GET /payroll/employees/:payrollEmployeeId/calculate
```

> Los endpoints anteriores corresponden a la implementación actual del backend.

---

# 📚 Swagger

La API cuenta con documentación interactiva mediante Swagger.

Con el servidor ejecutándose, acceder a:

```text
http://localhost:3000/api
```

Desde Swagger es posible:

* Consultar endpoints.
* Revisar DTOs.
* Ver parámetros.
* Ejecutar peticiones.
* Revisar respuestas.
* Probar errores HTTP.

---

# ⚙️ Instalación

Clonar el repositorio:

```bash
git clone https://github.com/diegomartine/Smart-Payroll-AI.git
```

Entrar al backend:

```bash
cd Smart-Payroll-AI/backend
```

Instalar dependencias:

```bash
npm install
```

---

# 🔐 Variables de entorno

Crear un archivo:

```text
.env
```

con la configuración necesaria para PostgreSQL.

Ejemplo:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5434/smart_payroll?schema=public"
```

> No subir el archivo `.env` al repositorio. Las credenciales deben mantenerse privadas.

---

# 🗃️ Base de datos

El proyecto utiliza PostgreSQL y Prisma ORM.

Generar el cliente:

```bash
npx prisma generate
```

Aplicar migraciones en desarrollo:

```bash
npx prisma migrate dev
```

Consultar el estado de las migraciones:

```bash
npx prisma migrate status
```

Abrir Prisma Studio:

```bash
npx prisma studio
```

---

# ▶️ Ejecución

Modo desarrollo:

```bash
npm run start:dev
```

Modo normal:

```bash
npm run start
```

Compilar:

```bash
npm run build
```

Ejecutar versión compilada:

```bash
npm run start:prod
```

---

# 🧪 Pruebas

Ejecutar pruebas:

```bash
npm run test
```

Ejecutar pruebas en modo watch:

```bash
npm run test:watch
```

Ejecutar cobertura:

```bash
npm run test:cov
```

---

# 🛡️ Validaciones y reglas de negocio

El backend implementa validaciones para proteger la integridad de la información.

Entre ellas:

* Validación de DTOs.
* Validación de identificadores.
* Validación de existencia de empleados.
* Validación de existencia de nóminas.
* Prevención de asociaciones duplicadas.
* Restricción de modificaciones según el estado de la nómina.
* Manejo de errores HTTP.
* Validación de transiciones de estado.
* Uso de `Decimal` para valores monetarios.

Ejemplo:

```text
DRAFT
  │
  ├── PROCESSING
  │
  └── CANCELLED
```

Una nómina que ya está siendo procesada no debe modificarse mediante operaciones que alteren sus datos.

---

# 🏗️ Arquitectura

El backend sigue una arquitectura modular basada en NestJS:

```text
backend/
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── src/
│   ├── employees/
│   │   ├── dto/
│   │   ├── employees.controller.ts
│   │   ├── employees.service.ts
│   │   └── employees.module.ts
│   │
│   ├── payroll/
│   │   ├── dto/
│   │   ├── payroll.controller.ts
│   │   ├── payroll.service.ts
│   │   └── payroll.module.ts
│   │
│   ├── health/
│   ├── prisma/
│   ├── app.module.ts
│   └── main.ts
│
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

---

# 🔄 Flujo principal

El flujo principal de procesamiento es:

```text
1. Crear empleado
        ↓
2. Crear nómina
        ↓
3. Asociar empleado a nómina
        ↓
4. Registrar novedades
        ↓
5. Calcular nómina
        ↓
6. Procesar nómina
        ↓
7. Completar nómina
```

Ejemplo:

```text
Empleado
   │
   ▼
Nómina 2026-11
   │
   ▼
PayrollEmployee
   │
   ├── Salario base
   ├── Horas extras
   ├── Bonificaciones
   └── Deducciones
          │
          ▼
      Cálculo
          │
          ▼
      Neto a pagar
```

---

# 📌 Estado actual

El backend cuenta actualmente con:

* ✅ Módulo de empleados.
* ✅ CRUD de empleados.
* ✅ Módulo de nómina.
* ✅ CRUD de nóminas.
* ✅ Estados de nómina.
* ✅ Asociación empleado-nómina.
* ✅ Novedades de nómina.
* ✅ Tipos de novedades.
* ✅ CRUD de novedades.
* ✅ Validaciones de modificación por estado.
* ✅ Cálculo de nómina por empleado.
* ✅ Manejo de valores monetarios con `Decimal`.
* ✅ PostgreSQL.
* ✅ Prisma ORM.
* ✅ Migraciones.
* ✅ Swagger.
* ✅ Health Check.
* ✅ Validación de datos mediante DTOs.

---

# 🚧 Próximas funcionalidades

El backend está preparado para evolucionar hacia funcionalidades como:

* Cálculo completo de una nómina.
* Deducciones legales colombianas.
* Seguridad y autenticación.
* Roles y permisos.
* Generación de reportes.
* Exportación PDF.
* Exportación Excel.
* Historial de procesamiento.
* Auditoría.
* Integración con funcionalidades de inteligencia artificial.

---

## 👨‍💻 Proyecto

**Smart-Payroll-AI**

Sistema de gestión y procesamiento de nómina desarrollado como proyecto de portfolio, aplicando arquitectura modular, API REST, ORM, PostgreSQL, validaciones y reglas de negocio.

---
