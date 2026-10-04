# Medición antes de optimizar

Fecha de ejecución: 2026-10-05. Entorno local con Node.js, PostgreSQL 16 en Docker y 2.000 registros generados por `prisma/seed-carga.cjs`. El endpoint todavía no tenía paginación ni selección limitada de campos.

## Preparación

```bash
docker start rescatefresco-db
npm run db:push
npm run db:seed
npm run db:seed:carga
npm start
curl http://localhost:3000/api/health
node scripts/medir-ofertas.mjs
```

El seed informó `2000 ofertas [CARGA] insertadas` y el health check respondió:

```json
{"success":true,"data":{"status":"ok"}}
```

## Medición HTTP

```text
Intento 1: 261.44 ms, 554.45 KB, 1004 ítems
Intento 2: 115.48 ms, 554.45 KB, 1004 ítems
Intento 3: 107.96 ms, 554.45 KB, 1004 ítems
Intento 4: 98.49 ms, 554.45 KB, 1004 ítems
Intento 5: 85.34 ms, 554.45 KB, 1004 ítems
Intento 6: 90.57 ms, 554.45 KB, 1004 ítems
Intento 7: 82.06 ms, 554.45 KB, 1004 ítems
Intento 8: 76.89 ms, 554.45 KB, 1004 ítems
Intento 9: 76.21 ms, 554.45 KB, 1004 ítems
Intento 10: 71.16 ms, 554.45 KB, 1004 ítems
```

| Métrica | Antes |
| --- | ---: |
| Tiempo promedio | 106.56 ms |
| Tamaño promedio | 554.45 KB |
| Ítems por respuesta | 1004 |

## EXPLAIN ANALYZE

Consulta medida:

```sql
SELECT *
FROM "OFERTA_ALIMENTO"
WHERE estado_oferta = 'DISPONIBLE'
ORDER BY fecha_publicacion DESC;
```

### Sin index scan ni bitmap scan

```sql
SET enable_indexscan=off;
SET enable_bitmapscan=off;
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM "OFERTA_ALIMENTO"
WHERE estado_oferta = 'DISPONIBLE'
ORDER BY fecha_publicacion DESC;
```

```text
Sort  (cost=51.09..51.09 rows=3 width=514) (actual time=1.033..1.085 rows=1004 loops=1)
  Sort Key: fecha_publicacion DESC
  Sort Method: quicksort  Memory: 192kB
  Buffers: shared hit=46
  -> Seq Scan on "OFERTA_ALIMENTO" (actual time=0.009..0.527 rows=1004 loops=1)
       Filter: ((estado_oferta)::text = 'DISPONIBLE'::text)
       Rows Removed by Filter: 999
       Buffers: shared hit=43
Planning Time: 0.467 ms
Execution Time: 1.176 ms
```

### Con índices activos

```sql
RESET enable_indexscan;
RESET enable_bitmapscan;
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM "OFERTA_ALIMENTO"
WHERE estado_oferta = 'DISPONIBLE'
ORDER BY fecha_publicacion DESC;
```

```text
Sort  (cost=13.98..13.99 rows=3 width=514) (actual time=0.906..0.957 rows=1004 loops=1)
  Sort Key: fecha_publicacion DESC
  Sort Method: quicksort  Memory: 192kB
  Buffers: shared hit=48
  -> Bitmap Heap Scan on "OFERTA_ALIMENTO" (actual time=0.093..0.432 rows=1004 loops=1)
       Recheck Cond: ((estado_oferta)::text = 'DISPONIBLE'::text)
       Heap Blocks: exact=43
       Buffers: shared hit=45
       -> Bitmap Index Scan on "OFERTA_ALIMENTO_estado_oferta_idx" (actual time=0.063..0.063 rows=1004 loops=1)
            Index Cond: ((estado_oferta)::text = 'DISPONIBLE'::text)
            Buffers: shared hit=2
Planning Time: 0.408 ms
Execution Time: 1.076 ms
```

| Plan | Filas | Tiempo de ejecución |
| --- | ---: | ---: |
| Escaneo secuencial forzado | 1004 | 1.176 ms |
| Índices activos | 1004 | 1.076 ms |

La mejora observada del plan con índices fue de 8,50 %, aunque PostgreSQL todavía necesitó ordenar las filas porque no existía un índice compuesto por estado y fecha de publicación.
