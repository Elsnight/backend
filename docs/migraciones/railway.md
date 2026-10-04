# Aplicación de migraciones en Railway

Estas instrucciones son deliberadamente manuales para evitar modificar la base de datos de producción desde el entorno de desarrollo.

## 1. Verificar y corregir datos

1. Obtén `DATABASE_URL` desde las variables del servicio PostgreSQL de Railway, sin guardarla en Git.
2. Haz un respaldo de la base antes de corregir datos.
3. Ejecuta las consultas de diagnóstico:

```bash
psql "$DATABASE_URL" -f docs/migraciones/verificar-antes-de-check.sql
```

Todas las consultas deben devolver cero filas. Corrige explícitamente cualquier registro reportado y vuelve a ejecutar el archivo. No apliques la migración mientras existan infracciones.

## 2. Registrar el baseline existente

Ejecuta una sola vez, apuntando al `DATABASE_URL` de Railway:

```bash
DATABASE_URL="postgresql://...railway..." npx prisma migrate resolve --applied 0_init
```

No ejecutes el SQL de `0_init` sobre la base existente: el comando solo registra que ese esquema ya estaba creado antes de adoptar Prisma Migrate.

## 3. Desplegar mediante el Start Command

Configura en Railway el **Start Command** del servicio backend como:

```text
npm run start:prod
```

El comando ejecuta `prisma migrate deploy` antes de iniciar `node src/app.js`, por lo que aplicará `1_check_constraints` y las migraciones futuras de forma no interactiva.

Antes del siguiente despliegue también configura `NODE_ENV=production` y `CORS_ORIGIN` con los orígenes web permitidos. Las aplicaciones móviles sin encabezado `Origin` seguirán permitidas.
