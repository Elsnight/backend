# RescateFresco API — Documentación

**Base URL (Railway):** `https://backend-production-e263.up.railway.app`  
**Entorno local:** `http://localhost:3000`  
**Swagger UI:** `/api/docs`  
**Health Check:** `/api/health`

---

## Formato de respuesta

### Éxito
```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error",
    "details": null
  }
}
```

---

## Autenticación

Todas las rutas protegidas usan **Bearer Token** (JWT) en el header:

```
Authorization: Bearer <access_token>
```

Roles: `CONSUMIDOR`, `COMERCIANTE`, `ADMINISTRADOR`

---

## Endpoints

### Health

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/health` | ❌ | Verificar que el servidor está vivo |

---

### Auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/registro` | ❌ | Registrar un nuevo usuario |
| POST | `/api/auth/login` | ❌ | Iniciar sesión (devuelve access + refresh token) |
| POST | `/api/auth/refresh` | ❌ | Renovar access token con refresh token |
| POST | `/api/auth/logout` | ✅ | Cerrar sesión (revocar refresh token) |

#### POST /api/auth/registro
```json
{
  "nombres": "string",
  "apellidos": "string",
  "correo": "string",
  "contrasena": "string",
  "rol_id": 1,
  "telefono": "string | null"
}
```
**Respuesta 201:** Usuario creado.

#### POST /api/auth/login
```json
{
  "correo": "string",
  "contrasena": "string"
}
```
**Respuesta 200:**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "usuario": { ... }
}
```

#### POST /api/auth/refresh
```json
{
  "refreshToken": "string"
}
```

#### POST /api/auth/logout
Header: `Authorization: Bearer <token>`  
Body:
```json
{
  "refreshToken": "string"
}
```

---

### Ofertas (público)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/ofertas` | ❌ | Listar ofertas disponibles (con filtros) |
| GET | `/api/ofertas/:id` | ❌ | Obtener detalle de una oferta |

#### GET /api/ofertas
Parámetros query opcionales:
- `categoria_id` (int)
- `ciudad` (string)
- `precio_max` (number)

---

### Ofertas (COMERCIANTE)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/ofertas` | ✅ COMERCIANTE | Crear nueva oferta |
| PUT | `/api/ofertas/:id` | ✅ COMERCIANTE (dueño) | Actualizar oferta |
| PATCH | `/api/ofertas/:id/estado` | ✅ COMERCIANTE (dueño) | Cambiar estado |
| DELETE | `/api/ofertas/:id` | ✅ COMERCIANTE (dueño) | Eliminar (desactivar) oferta |

#### PATCH /api/ofertas/:id/estado
```json
{
  "estado_oferta": "DISPONIBLE | AGOTADA | PAUSADA | EXPIRADA"
}
```

---

### Comercios

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/comercios` | ✅ | Registrar un comercio |
| POST | `/api/comercios/:id/sucursales` | ✅ | Agregar sucursal |

#### POST /api/comercios
```json
{
  "ruc": "string",
  "razon_social": "string",
  "nombre_comercial": "string",
  "correo_contacto": "string"
}
```

#### POST /api/comercios/:id/sucursales
```json
{
  "nombre": "string",
  "direccion": "string",
  "ciudad": "string",
  "latitud": 0.0,
  "longitud": 0.0,
  "telefono": "string | null"
}
```

---

### Reservas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/reservas` | ✅ CONSUMIDOR | Crear una reserva |
| GET | `/api/reservas/mias` | ✅ CONSUMIDOR | Listar reservas del usuario |

#### POST /api/reservas
```json
{
  "sucursal_id": "uuid",
  "items": [
    { "oferta_id": "uuid", "cantidad": 1 }
  ]
}
```

---

### Retiros

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/retiros/validar` | ✅ COMERCIANTE | Validar retiro de una reserva |

#### POST /api/retiros/validar
```json
{
  "codigo_retiro": "string",
  "metodo_validacion": "QR | CODIGO_MANUAL",
  "observacion": "string | null"
}
```

---

### Admin

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/admin/comercios/pendientes` | ✅ ADMIN | Listar comercios pendientes de validación |
| PATCH | `/api/admin/comercios/:id/estado` | ✅ ADMIN | Aprobar o suspender un comercio |

#### PATCH /api/admin/comercios/:id/estado
```json
{
  "estado_comercio": "ACTIVO | SUSPENDIDO"
}
```

---

## Estados disponibles en la base de datos

| Tabla | Campo | Valores |
|-------|-------|---------|
| USUARIO | estado_usuario | `ACTIVO`, `BLOQUEADO`, `PENDIENTE` |
| COMERCIO | estado_comercio | `PENDIENTE_VALIDACION`, `ACTIVO`, `SUSPENDIDO` |
| OFERTA_ALIMENTO | estado_oferta | `DISPONIBLE`, `AGOTADA`, `PAUSADA`, `EXPIRADA` |
| RESERVA | estado_reserva | `PENDIENTE_PAGO`, `PAGADA`, `LISTA_RETIRO`, `RETIRADA`, `CANCELADA`, `EXPIRADA` |
| PAGO | estado_pago | `INICIADO`, `APROBADO`, `RECHAZADO`, `REVERSADO` |
| PAGO | metodo_pago | `TARJETA`, `TRANSFERENCIA`, `BILLETERA` |
| RETIRO | metodo_validacion | `QR`, `CODIGO_MANUAL` |

---

## Stack técnico

- **Runtime:** Node.js + Express
- **ORM:** Prisma 6 + PostgreSQL
- **Validación:** Zod
- **Auth:** JWT (access + refresh tokens con rotación)
- **Documentación:** Swagger UI + swagger-jsdoc
- **Hosting:** Railway