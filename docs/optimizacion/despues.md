# Medición después de optimizar

Fecha de ejecución: 2026-10-05. Entorno local con Node.js, PostgreSQL 16 en Docker y 2.000 ofertas regeneradas mediante `npm run db:seed:carga`. El servidor se ejecutó con `NODE_ENV=production`.

## Comandos

```bash
npm run db:seed:carga
node scripts/medir-ofertas.mjs
node scripts/medir-ofertas.mjs "http://localhost:3000/api/ofertas?latitud=-0.1807&longitud=-78.4678&radio=5"
docker exec rescatefresco-db psql -U rescatefresco -d rescatefresco -c 'ANALYZE "OFERTA_ALIMENTO";'
```

## Sin coordenadas

```text
Intento 1: 65.63 ms, 14.54 KB, 20 ítems
Intento 2: 9.87 ms, 14.54 KB, 20 ítems
Intento 3: 7.61 ms, 14.54 KB, 20 ítems
Intento 4: 8.34 ms, 14.54 KB, 20 ítems
Intento 5: 8.18 ms, 14.54 KB, 20 ítems
Intento 6: 6.15 ms, 14.54 KB, 20 ítems
Intento 7: 7.47 ms, 14.54 KB, 20 ítems
Intento 8: 9.91 ms, 14.54 KB, 20 ítems
Intento 9: 11.09 ms, 14.54 KB, 20 ítems
Intento 10: 7.34 ms, 14.54 KB, 20 ítems
```

Resumen: **14,16 ms**, **14,54 KB** y **20 ítems** por respuesta.

## Con coordenadas

URL: `GET /api/ofertas?latitud=-0.1807&longitud=-78.4678&radio=5`

```text
Intento 1: 129.23 ms, 14.87 KB, 20 ítems
Intento 2: 69.14 ms, 14.87 KB, 20 ítems
Intento 3: 59.51 ms, 14.87 KB, 20 ítems
Intento 4: 60.50 ms, 14.87 KB, 20 ítems
Intento 5: 54.97 ms, 14.87 KB, 20 ítems
Intento 6: 52.75 ms, 14.87 KB, 20 ítems
Intento 7: 50.32 ms, 14.87 KB, 20 ítems
Intento 8: 48.09 ms, 14.87 KB, 20 ítems
Intento 9: 44.33 ms, 14.87 KB, 20 ítems
Intento 10: 46.43 ms, 14.87 KB, 20 ítems
```

Resumen: **61,53 ms**, **14,87 KB** y **20 ítems**. No existe valor geográfico “antes” porque el endpoint previo no implementaba coordenadas.

## Comparación HTTP

| Métrica | Antes | Después | Mejora |
| --- | ---: | ---: | ---: |
| Tiempo promedio | 106,56 ms | 14,16 ms | 86,71 % |
| Tamaño promedio | 554,45 KB | 14,54 KB | 97,38 % |
| Ítems por respuesta | 1004 | 20 | 98,01 % menos |

La comparación incluye el costo real del nuevo envelope, selección explícita y paginación por defecto. La primera solicitud de cada corrida conserva el calentamiento del proceso y de las conexiones, igual que en la medición inicial.

## EXPLAIN ANALYZE de referencia

Se repitió la consulta completa usada en la medición inicial:

```sql
SELECT * FROM "OFERTA_ALIMENTO"
WHERE estado_oferta = 'DISPONIBLE'
ORDER BY fecha_publicacion DESC;
```

Sin escaneos por índice:

```text
Sort (actual time=1.016..1.068 rows=1006 loops=1)
  Sort Method: quicksort  Memory: 192kB
  -> Seq Scan on "OFERTA_ALIMENTO" (actual time=0.007..0.552 rows=1006 loops=1)
       Rows Removed by Filter: 999
Planning Time: 0.544 ms
Execution Time: 1.156 ms
```

Con índices activos, PostgreSQL eligió también un escaneo secuencial porque la consulta completa recupera aproximadamente la mitad de la tabla:

```text
Sort (actual time=1.053..1.105 rows=1006 loops=1)
  Sort Method: quicksort  Memory: 192kB
  -> Seq Scan on "OFERTA_ALIMENTO" (actual time=0.006..0.595 rows=1006 loops=1)
       Rows Removed by Filter: 999
Planning Time: 0.516 ms
Execution Time: 1.190 ms
```

## EXPLAIN ANALYZE de la consulta paginada real

La consulta equivalente al endpoint optimizado agrega stock, vigencia y `LIMIT 20`:

```sql
SELECT oferta_id, titulo_publico, precio_original, precio_oferta,
       stock_disponible, estado_oferta, fin_retiro
FROM "OFERTA_ALIMENTO"
WHERE estado_oferta = 'DISPONIBLE'
  AND stock_disponible > 0
  AND fin_retiro > NOW()
ORDER BY fecha_publicacion DESC
LIMIT 20;
```

Con índices desactivados:

```text
Limit (actual time=0.783..0.786 rows=20 loops=1)
  -> Sort (actual time=0.782..0.783 rows=20 loops=1)
       Sort Method: top-N heapsort  Memory: 27kB
       -> Seq Scan on "OFERTA_ALIMENTO" (actual time=0.007..0.546 rows=1003 loops=1)
Planning Time: 0.521 ms
Execution Time: 0.812 ms
```

Con el índice compuesto `OFERTA_ALIMENTO_estado_oferta_fecha_publicacion_idx`:

```text
Limit (actual time=0.019..0.037 rows=20 loops=1)
  -> Index Scan using "OFERTA_ALIMENTO_estado_oferta_fecha_publicacion_idx"
       (actual time=0.018..0.033 rows=20 loops=1)
       Index Cond: (estado_oferta = 'DISPONIBLE')
       Filter: ((stock_disponible > 0) AND (fin_retiro > now()))
Planning Time: 0.530 ms
Execution Time: 0.062 ms
```

| Plan paginado | Tiempo de ejecución | Mejora |
| --- | ---: | ---: |
| Escaneo secuencial forzado | 0,812 ms | - |
| Índice compuesto activo | 0,062 ms | 92,36 % |
