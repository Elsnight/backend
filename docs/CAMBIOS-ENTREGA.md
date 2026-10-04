# Cambios de entrega

## Commits

| Commit | Bloque | Descripción |
| --- | --- | --- |
| `5e61325` | 0 | `chore: medir rendimiento inicial de ofertas` |
| `ca39b91` | 1 | `feat: adoptar migraciones y restricciones de integridad` |
| `58030d1` | 2 | `feat: paginar ofertas y agregar catalogo comerciante` |
| `fa10242` | 3 | `feat: agregar pagos simulados y reservas pendientes` |
| `e82e16d` | 4 | `feat: completar validacion transaccional de retiros` |
| `9d9a436` | 5 | `feat: endurecer seguridad y politica de acceso` |
| `9014bc3` | 6 | `test: agregar pruebas e2e y medicion final` |

## Contrato común

Todas las respuestas usan uno de estos sobres:

```json
{ "success": true, "data": {}, "meta": {} }
```

```json
{ "success": false, "error": { "code": "CODE", "message": "Mensaje", "details": {} } }
```

Los endpoints protegidos requieren `Authorization: Bearer <accessToken>`. Los `400` de Zod incluyen `error.details` por campo. Los errores Prisma `P2002` y `P2025` se traducen a `409` y `404`. En producción, los errores no controlados devuelven un `500` genérico.

## Endpoints finales

| Método | Ruta | Acceso | Body o query principal | Códigos |
| --- | --- | --- | --- | --- |
| GET | `/api/health` | Público | Sin body | 200 |
| POST | `/api/auth/registro` | Público, rate limit | Body: `nombres`, `apellidos`, `correo`, `contrasena`, exactamente uno de `rol`/`rol_nombre`/`rol_id`, `telefono?` | 201, 400, 409, 429 |
| POST | `/api/auth/login` | Público, rate limit | Body: `correo`, `contrasena` | 200, 400, 401, 403, 429 |
| POST | `/api/auth/refresh` | Público | Body: `refreshToken` | 200, 400, 401, 403 |
| POST | `/api/auth/logout` | Autenticado | Body: `refreshToken` | 200, 400, 401 |
| GET | `/api/ofertas` | Público | Query: `pagina/page`, `limite/limit`, `categoria_id`, `sucursal_id`, `ciudad`, `precio_max`, `actualizado_desde`, `estado`, `latitud`, `longitud`, `radio` | 200, 400 |
| GET | `/api/ofertas/mias` | COMERCIANTE | Query: `pagina/page`, `limite/limit`, `estado` | 200, 400, 401, 403 |
| GET | `/api/ofertas/:id` | Público | Path: UUID de oferta | 200, 404 |
| POST | `/api/ofertas` | COMERCIANTE dueño | Body: producto, sucursal, título, precios, stocks y fechas | 201, 400, 401, 403, 422 |
| PUT | `/api/ofertas/:id` | COMERCIANTE dueño | Body parcial de título, precios, stock y fechas | 200, 400, 401, 403, 404, 409, 422 |
| PATCH | `/api/ofertas/:id/estado` | COMERCIANTE dueño | Body: `estado_oferta` | 200, 400, 401, 403, 404 |
| DELETE | `/api/ofertas/:id` | COMERCIANTE dueño | Sin body; marca `EXPIRADA` | 200, 401, 403, 404 |
| GET | `/api/comercios/mios` | COMERCIANTE | Sin body; incluye sucursales activas | 200, 401, 403 |
| POST | `/api/comercios` | Autenticado | Body: `ruc`, `razon_social`, `nombre_comercial`, `correo_contacto` | 201, 400, 401, 409 |
| POST | `/api/comercios/:id/sucursales` | Dueño del comercio | Body: nombre, dirección, ciudad, coordenadas, teléfono | 201, 400, 401, 403, 404 |
| GET | `/api/productos/mios` | COMERCIANTE | Sin body | 200, 401, 403 |
| POST | `/api/productos` | COMERCIANTE dueño | Body: `comercio_id`, `categoria_id`, `nombre` y campos opcionales | 201, 400, 401, 403, 422 |
| PUT | `/api/productos/:id` | COMERCIANTE dueño | Body parcial de producto | 200, 400, 401, 403, 404, 422 |
| GET | `/api/categorias` | Público | Sin body | 200 |
| POST | `/api/reservas` | CONSUMIDOR, idempotente | Body: `{sucursal_id, items:[{oferta_id,cantidad}]}` | 201, 400, 401, 403, 404, 409 |
| GET | `/api/reservas/mias` | CONSUMIDOR | Sin body | 200, 401, 403 |
| PATCH | `/api/reservas/:id/cancelar` | CONSUMIDOR dueño, idempotente | Sin body | 200, 401, 403, 404, 409 |
| POST | `/api/pagos` | CONSUMIDOR dueño, idempotente | Body: `reserva_id`, `metodo_pago`, `simular_rechazo?` | 201, 400, 401, 403, 404, 409, 422 |
| GET | `/api/pagos/reserva/:reservaId` | CONSUMIDOR dueño | Path: UUID de reserva | 200, 401, 403, 404 |
| POST | `/api/retiros/validar` | COMERCIANTE dueño | Body: `codigo_retiro`, `metodo_validacion`, `observacion?` | 201, 400, 401, 403, 404, 409, 422 |
| GET | `/api/favoritos` | CONSUMIDOR | Sin body | 200, 401, 403 |
| POST | `/api/favoritos` | CONSUMIDOR, idempotente | Body: `comercio_id` | 201, 400, 401, 403, 404, 409 |
| DELETE | `/api/favoritos/:comercioId` | CONSUMIDOR | Path: UUID de comercio | 200, 401, 403, 404 |
| GET | `/api/admin/comercios/pendientes` | ADMINISTRADOR | Sin body | 200, 401, 403 |
| PATCH | `/api/admin/comercios/:id/estado` | ADMINISTRADOR | Body: `estado_comercio` (`ACTIVO`/`SUSPENDIDO`) | 200, 400, 401, 403, 404 |

La documentación interactiva está disponible en `/api/docs`. Los pagos están documentados explícitamente como una simulación local sin pasarela real.

## Optimización

Mediciones de 10 solicitudes contra PostgreSQL local con 2.000 ofertas de carga:

| Métrica | Antes | Después | Mejora |
| --- | ---: | ---: | ---: |
| Tiempo promedio | 106,56 ms | 14,16 ms | 86,71 % |
| Tamaño promedio | 554,45 KB | 14,54 KB | 97,38 % |
| Ítems por respuesta | 1004 | 20 | 98,01 % menos |

La consulta paginada real pasó de 0,812 ms con escaneo secuencial forzado a 0,062 ms con el índice compuesto, una mejora de 92,36 %. La medición geográfica posterior fue 61,53 ms, 14,87 KB y 20 ítems; no tiene equivalente anterior porque la funcionalidad no existía.

Salidas completas: `docs/optimizacion/antes.md` y `docs/optimizacion/despues.md`.

## Pruebas Newman

| Métrica | Aprobados | Fallidos |
| --- | ---: | ---: |
| Solicitudes | 25 | 0 |
| Aserciones | 32 | 0 |

Resultado completo: `docs/pruebas/newman-results.json`. Resumen legible: `docs/pruebas/newman-resumen.md`.

## Pendiente en Railway

No se modificaron variables ni datos de producción durante esta entrega.

1. Configurar `NODE_ENV=production`.
2. Configurar `CORS_ORIGIN` con los orígenes web permitidos, separados por comas. Las apps móviles sin encabezado `Origin` están permitidas.
3. Confirmar que `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` existan; el servidor ya no inicia sin ambos.
4. Respaldar PostgreSQL y ejecutar `psql "$DATABASE_URL" -f docs/migraciones/verificar-antes-de-check.sql`. Corregir cualquier fila devuelta.
5. Registrar una sola vez el baseline existente con `DATABASE_URL="...Railway..." npx prisma migrate resolve --applied 0_init`.
6. Cambiar el Start Command del servicio a `npm run start:prod` para ejecutar `prisma migrate deploy` antes de arrancar.
7. Reejecutar `npm run db:seed` solo si producción necesita roles/categorías o las cuentas demo de forma intencional. No ejecutar `npm run db:seed:carga` en producción.

Los detalles operativos del baseline están en `docs/migraciones/railway.md`.
