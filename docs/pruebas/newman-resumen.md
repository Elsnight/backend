# Resultado Newman

Fecha: 2026-10-05.

Comando ejecutado:

```bash
npx newman run docs/postman/RescateFresco.postman_collection.json \
  -e docs/postman/RescateFresco.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export docs/pruebas/newman-results.json
```

| Métrica | Ejecutados | Fallidos |
| --- | ---: | ---: |
| Iteraciones | 1 | 0 |
| Solicitudes | 25 | 0 |
| Scripts de prueba | 25 | 0 |
| Scripts pre-request | 25 | 0 |
| Aserciones | 32 | 0 |

Duración total: 1.465 s. Tiempo promedio de respuesta: 43 ms. Datos recibidos: 16,61 KB.

La primera ejecución detectó que dos refresh tokens emitidos en el mismo segundo podían ser idénticos. Se corrigió agregando un `jti` aleatorio y se repitió la colección completa; la tabla y `newman-results.json` corresponden exclusivamente a la ejecución final exitosa.
