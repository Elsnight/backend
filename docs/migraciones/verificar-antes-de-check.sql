-- Ejecutar antes de aplicar 1_check_constraints. Cada consulta debe devolver cero filas.

SELECT * FROM "OFERTA_ALIMENTO" WHERE precio_original <= 0;
SELECT * FROM "OFERTA_ALIMENTO" WHERE precio_oferta <= 0;
SELECT * FROM "OFERTA_ALIMENTO" WHERE precio_oferta >= precio_original;
SELECT * FROM "OFERTA_ALIMENTO" WHERE stock_inicial <= 0;
SELECT * FROM "OFERTA_ALIMENTO" WHERE stock_disponible < 0;
SELECT * FROM "OFERTA_ALIMENTO" WHERE stock_disponible > stock_inicial;
SELECT * FROM "OFERTA_ALIMENTO" WHERE inicio_retiro >= fin_retiro;
SELECT * FROM "OFERTA_ALIMENTO" WHERE fin_retiro > fecha_vencimiento;
SELECT * FROM "OFERTA_ALIMENTO"
WHERE estado_oferta NOT IN ('DISPONIBLE', 'AGOTADA', 'PAUSADA', 'EXPIRADA');

SELECT * FROM "USUARIO"
WHERE estado_usuario NOT IN ('ACTIVO', 'BLOQUEADO', 'PENDIENTE');

SELECT * FROM "COMERCIO"
WHERE estado_comercio NOT IN ('PENDIENTE_VALIDACION', 'ACTIVO', 'SUSPENDIDO');

SELECT * FROM "RESERVA"
WHERE estado_reserva NOT IN (
  'PENDIENTE_PAGO', 'PAGADA', 'LISTA_RETIRO', 'RETIRADA', 'CANCELADA', 'EXPIRADA'
);
SELECT * FROM "RESERVA" WHERE subtotal < 0;
SELECT * FROM "RESERVA" WHERE total_pagar < 0;

SELECT * FROM "DETALLE_RESERVA" WHERE cantidad <= 0;
SELECT * FROM "DETALLE_RESERVA" WHERE precio_unitario <= 0;

SELECT * FROM "PAGO" WHERE monto <= 0;
SELECT * FROM "PAGO"
WHERE estado_pago NOT IN ('INICIADO', 'APROBADO', 'RECHAZADO', 'REVERSADO');

SELECT * FROM "RETIRO" WHERE metodo_validacion NOT IN ('QR', 'CODIGO_MANUAL');

SELECT * FROM "SUCURSAL" WHERE latitud NOT BETWEEN -90 AND 90;
SELECT * FROM "SUCURSAL" WHERE longitud NOT BETWEEN -180 AND 180;

-- El índice único parcial exige como máximo un pago aprobado por reserva.
SELECT reserva_id, COUNT(*) AS pagos_aprobados
FROM "PAGO"
WHERE estado_pago = 'APROBADO'
GROUP BY reserva_id
HAVING COUNT(*) > 1;
