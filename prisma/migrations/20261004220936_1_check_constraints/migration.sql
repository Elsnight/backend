-- CreateIndex
CREATE INDEX "DETALLE_RESERVA_oferta_id_idx" ON "DETALLE_RESERVA"("oferta_id");

-- CreateIndex
CREATE INDEX "PAGO_reserva_id_idx" ON "PAGO"("reserva_id");

-- CreateIndex
CREATE INDEX "PRODUCTO_comercio_id_idx" ON "PRODUCTO"("comercio_id");

-- CreateIndex
CREATE INDEX "RESERVA_usuario_id_idx" ON "RESERVA"("usuario_id");

-- CreateIndex
CREATE INDEX "RESERVA_sucursal_id_idx" ON "RESERVA"("sucursal_id");

-- CheckConstraint
ALTER TABLE "OFERTA_ALIMENTO"
  ADD CONSTRAINT "OFERTA_ALIMENTO_precio_original_check" CHECK (precio_original > 0),
  ADD CONSTRAINT "OFERTA_ALIMENTO_precio_oferta_check" CHECK (precio_oferta > 0),
  ADD CONSTRAINT "OFERTA_ALIMENTO_descuento_check" CHECK (precio_oferta < precio_original),
  ADD CONSTRAINT "OFERTA_ALIMENTO_stock_inicial_check" CHECK (stock_inicial > 0),
  ADD CONSTRAINT "OFERTA_ALIMENTO_stock_disponible_check" CHECK (stock_disponible >= 0),
  ADD CONSTRAINT "OFERTA_ALIMENTO_stock_limite_check" CHECK (stock_disponible <= stock_inicial),
  ADD CONSTRAINT "OFERTA_ALIMENTO_retiro_check" CHECK (inicio_retiro < fin_retiro),
  ADD CONSTRAINT "OFERTA_ALIMENTO_vencimiento_check" CHECK (fin_retiro <= fecha_vencimiento),
  ADD CONSTRAINT "OFERTA_ALIMENTO_estado_check" CHECK (estado_oferta IN ('DISPONIBLE', 'AGOTADA', 'PAUSADA', 'EXPIRADA'));

ALTER TABLE "USUARIO"
  ADD CONSTRAINT "USUARIO_estado_check" CHECK (estado_usuario IN ('ACTIVO', 'BLOQUEADO', 'PENDIENTE'));

ALTER TABLE "COMERCIO"
  ADD CONSTRAINT "COMERCIO_estado_check" CHECK (estado_comercio IN ('PENDIENTE_VALIDACION', 'ACTIVO', 'SUSPENDIDO'));

ALTER TABLE "RESERVA"
  ADD CONSTRAINT "RESERVA_estado_check" CHECK (estado_reserva IN ('PENDIENTE_PAGO', 'PAGADA', 'LISTA_RETIRO', 'RETIRADA', 'CANCELADA', 'EXPIRADA')),
  ADD CONSTRAINT "RESERVA_subtotal_check" CHECK (subtotal >= 0),
  ADD CONSTRAINT "RESERVA_total_check" CHECK (total_pagar >= 0);

ALTER TABLE "DETALLE_RESERVA"
  ADD CONSTRAINT "DETALLE_RESERVA_cantidad_check" CHECK (cantidad > 0),
  ADD CONSTRAINT "DETALLE_RESERVA_precio_check" CHECK (precio_unitario > 0);

ALTER TABLE "PAGO"
  ADD CONSTRAINT "PAGO_monto_check" CHECK (monto > 0),
  ADD CONSTRAINT "PAGO_estado_check" CHECK (estado_pago IN ('INICIADO', 'APROBADO', 'RECHAZADO', 'REVERSADO'));

ALTER TABLE "RETIRO"
  ADD CONSTRAINT "RETIRO_metodo_check" CHECK (metodo_validacion IN ('QR', 'CODIGO_MANUAL'));

ALTER TABLE "SUCURSAL"
  ADD CONSTRAINT "SUCURSAL_latitud_check" CHECK (latitud BETWEEN -90 AND 90),
  ADD CONSTRAINT "SUCURSAL_longitud_check" CHECK (longitud BETWEEN -180 AND 180);

-- Un solo pago aprobado por reserva; se permiten varios intentos rechazados.
CREATE UNIQUE INDEX "PAGO_reserva_aprobado_key"
ON "PAGO"("reserva_id")
WHERE estado_pago = 'APROBADO';
