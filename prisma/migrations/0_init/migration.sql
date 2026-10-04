-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "ROL" (
    "rol_id" SMALLINT NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "descripcion" VARCHAR(150),

    CONSTRAINT "ROL_pkey" PRIMARY KEY ("rol_id")
);

-- CreateTable
CREATE TABLE "USUARIO" (
    "usuario_id" UUID NOT NULL,
    "rol_id" SMALLINT NOT NULL,
    "nombres" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(20),
    "hash_contrasena" VARCHAR(255) NOT NULL,
    "estado_usuario" VARCHAR(15) NOT NULL,
    "fecha_registro" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "USUARIO_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "COMERCIO" (
    "comercio_id" UUID NOT NULL,
    "usuario_propietario_id" UUID NOT NULL,
    "ruc" VARCHAR(13) NOT NULL,
    "razon_social" VARCHAR(160) NOT NULL,
    "nombre_comercial" VARCHAR(160) NOT NULL,
    "correo_contacto" VARCHAR(150) NOT NULL,
    "estado_comercio" VARCHAR(25) NOT NULL,
    "fecha_registro" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "COMERCIO_pkey" PRIMARY KEY ("comercio_id")
);

-- CreateTable
CREATE TABLE "SUCURSAL" (
    "sucursal_id" UUID NOT NULL,
    "comercio_id" UUID NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "direccion" VARCHAR(255) NOT NULL,
    "ciudad" VARCHAR(80) NOT NULL,
    "latitud" DECIMAL(9,6) NOT NULL,
    "longitud" DECIMAL(9,6) NOT NULL,
    "telefono" VARCHAR(20),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SUCURSAL_pkey" PRIMARY KEY ("sucursal_id")
);

-- CreateTable
CREATE TABLE "CATEGORIA" (
    "categoria_id" SMALLINT NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "descripcion" VARCHAR(180),
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CATEGORIA_pkey" PRIMARY KEY ("categoria_id")
);

-- CreateTable
CREATE TABLE "PRODUCTO" (
    "producto_id" UUID NOT NULL,
    "comercio_id" UUID NOT NULL,
    "categoria_id" SMALLINT NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "informacion_alergenos" VARCHAR(500),
    "imagen_url" VARCHAR(500),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PRODUCTO_pkey" PRIMARY KEY ("producto_id")
);

-- CreateTable
CREATE TABLE "OFERTA_ALIMENTO" (
    "oferta_id" UUID NOT NULL,
    "producto_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "titulo_publico" VARCHAR(160) NOT NULL,
    "precio_original" DECIMAL(10,2) NOT NULL,
    "precio_oferta" DECIMAL(10,2) NOT NULL,
    "stock_inicial" INTEGER NOT NULL,
    "stock_disponible" INTEGER NOT NULL,
    "fecha_publicacion" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" TIMESTAMPTZ NOT NULL,
    "inicio_retiro" TIMESTAMPTZ NOT NULL,
    "fin_retiro" TIMESTAMPTZ NOT NULL,
    "estado_oferta" VARCHAR(15) NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OFERTA_ALIMENTO_pkey" PRIMARY KEY ("oferta_id")
);

-- CreateTable
CREATE TABLE "RESERVA" (
    "reserva_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "codigo_retiro" VARCHAR(12) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "total_pagar" DECIMAL(10,2) NOT NULL,
    "estado_reserva" VARCHAR(20) NOT NULL,
    "fecha_reserva" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_limite_retiro" TIMESTAMPTZ NOT NULL,
    "fecha_cancelacion" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RESERVA_pkey" PRIMARY KEY ("reserva_id")
);

-- CreateTable
CREATE TABLE "DETALLE_RESERVA" (
    "detalle_reserva_id" UUID NOT NULL,
    "reserva_id" UUID NOT NULL,
    "oferta_id" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal_linea" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "DETALLE_RESERVA_pkey" PRIMARY KEY ("detalle_reserva_id")
);

-- CreateTable
CREATE TABLE "PAGO" (
    "pago_id" UUID NOT NULL,
    "reserva_id" UUID NOT NULL,
    "proveedor_pago" VARCHAR(80) NOT NULL,
    "referencia_externa" VARCHAR(120),
    "metodo_pago" VARCHAR(30) NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "moneda" CHAR(3) NOT NULL DEFAULT 'USD',
    "estado_pago" VARCHAR(15) NOT NULL,
    "fecha_proceso" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PAGO_pkey" PRIMARY KEY ("pago_id")
);

-- CreateTable
CREATE TABLE "RETIRO" (
    "retiro_id" UUID NOT NULL,
    "reserva_id" UUID NOT NULL,
    "verificado_por_usuario_id" UUID NOT NULL,
    "metodo_validacion" VARCHAR(20) NOT NULL,
    "fecha_retiro" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacion" VARCHAR(300),

    CONSTRAINT "RETIRO_pkey" PRIMARY KEY ("retiro_id")
);

-- CreateTable
CREATE TABLE "FAVORITO" (
    "usuario_id" UUID NOT NULL,
    "comercio_id" UUID NOT NULL,
    "fecha_creacion" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FAVORITO_pkey" PRIMARY KEY ("usuario_id","comercio_id")
);

-- CreateTable
CREATE TABLE "IDEMPOTENCY_RECORD" (
    "id" SERIAL NOT NULL,
    "idempotency_key" VARCHAR(255) NOT NULL,
    "endpoint" VARCHAR(255) NOT NULL,
    "usuario_id" UUID NOT NULL,
    "respuesta_guardada" JSONB NOT NULL,
    "codigo_estado" INTEGER NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IDEMPOTENCY_RECORD_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "REFRESH_TOKEN" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "revocado" BOOLEAN NOT NULL DEFAULT false,
    "expira_en" TIMESTAMPTZ NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "REFRESH_TOKEN_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ROL_nombre_key" ON "ROL"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "USUARIO_correo_key" ON "USUARIO"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "COMERCIO_ruc_key" ON "COMERCIO"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "SUCURSAL_comercio_id_nombre_key" ON "SUCURSAL"("comercio_id", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "CATEGORIA_nombre_key" ON "CATEGORIA"("nombre");

-- CreateIndex
CREATE INDEX "OFERTA_ALIMENTO_sucursal_id_idx" ON "OFERTA_ALIMENTO"("sucursal_id");

-- CreateIndex
CREATE INDEX "OFERTA_ALIMENTO_estado_oferta_idx" ON "OFERTA_ALIMENTO"("estado_oferta");

-- CreateIndex
CREATE INDEX "OFERTA_ALIMENTO_fecha_vencimiento_idx" ON "OFERTA_ALIMENTO"("fecha_vencimiento");

-- CreateIndex
CREATE UNIQUE INDEX "RESERVA_codigo_retiro_key" ON "RESERVA"("codigo_retiro");

-- CreateIndex
CREATE UNIQUE INDEX "DETALLE_RESERVA_reserva_id_oferta_id_key" ON "DETALLE_RESERVA"("reserva_id", "oferta_id");

-- CreateIndex
CREATE UNIQUE INDEX "PAGO_referencia_externa_key" ON "PAGO"("referencia_externa");

-- CreateIndex
CREATE UNIQUE INDEX "RETIRO_reserva_id_key" ON "RETIRO"("reserva_id");

-- CreateIndex
CREATE UNIQUE INDEX "IDEMPOTENCY_RECORD_idempotency_key_endpoint_usuario_id_key" ON "IDEMPOTENCY_RECORD"("idempotency_key", "endpoint", "usuario_id");

-- AddForeignKey
ALTER TABLE "USUARIO" ADD CONSTRAINT "USUARIO_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "ROL"("rol_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COMERCIO" ADD CONSTRAINT "COMERCIO_usuario_propietario_id_fkey" FOREIGN KEY ("usuario_propietario_id") REFERENCES "USUARIO"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SUCURSAL" ADD CONSTRAINT "SUCURSAL_comercio_id_fkey" FOREIGN KEY ("comercio_id") REFERENCES "COMERCIO"("comercio_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PRODUCTO" ADD CONSTRAINT "PRODUCTO_comercio_id_fkey" FOREIGN KEY ("comercio_id") REFERENCES "COMERCIO"("comercio_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PRODUCTO" ADD CONSTRAINT "PRODUCTO_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "CATEGORIA"("categoria_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OFERTA_ALIMENTO" ADD CONSTRAINT "OFERTA_ALIMENTO_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "PRODUCTO"("producto_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OFERTA_ALIMENTO" ADD CONSTRAINT "OFERTA_ALIMENTO_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "SUCURSAL"("sucursal_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RESERVA" ADD CONSTRAINT "RESERVA_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "USUARIO"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RESERVA" ADD CONSTRAINT "RESERVA_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "SUCURSAL"("sucursal_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DETALLE_RESERVA" ADD CONSTRAINT "DETALLE_RESERVA_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "RESERVA"("reserva_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DETALLE_RESERVA" ADD CONSTRAINT "DETALLE_RESERVA_oferta_id_fkey" FOREIGN KEY ("oferta_id") REFERENCES "OFERTA_ALIMENTO"("oferta_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PAGO" ADD CONSTRAINT "PAGO_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "RESERVA"("reserva_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RETIRO" ADD CONSTRAINT "RETIRO_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "RESERVA"("reserva_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RETIRO" ADD CONSTRAINT "RETIRO_verificado_por_usuario_id_fkey" FOREIGN KEY ("verificado_por_usuario_id") REFERENCES "USUARIO"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAVORITO" ADD CONSTRAINT "FAVORITO_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "USUARIO"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAVORITO" ADD CONSTRAINT "FAVORITO_comercio_id_fkey" FOREIGN KEY ("comercio_id") REFERENCES "COMERCIO"("comercio_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "REFRESH_TOKEN" ADD CONSTRAINT "REFRESH_TOKEN_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "USUARIO"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

