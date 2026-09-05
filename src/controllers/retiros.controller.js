const { PrismaClient } = require("@prisma/client");
const { successEnvelope, errorEnvelope } = require("../utils/envelope");

const prisma = new PrismaClient();

async function validarRetiro(req, res, next) {
  try {
    const { codigoRetiro, codigo_retiro, metodo_validacion, observacion } = req.body;
    const codigo = codigoRetiro || codigo_retiro;

    if (!codigo) {
      return res.status(400).json(errorEnvelope("BAD_REQUEST", "Código de retiro requerido"));
    }

    const reserva = await prisma.rESERVA.findUnique({
      where: { codigo_retiro: codigo },
      include: {
        sucursal: { select: { comercio_id: true } },
        detalles: { select: { cantidad: true, oferta_id: true } },
      },
    });

    if (!reserva) {
      return res
        .status(404)
        .json(errorEnvelope("NOT_FOUND", "Código de retiro inválido"));
    }

    if (reserva.estado_reserva !== "CONFIRMADA") {
      return res.status(400).json(
        errorEnvelope("BAD_REQUEST", `La reserva está en estado: ${reserva.estado_reserva}`),
      );
    }

    const comercio = await prisma.cOMERCIO.findUnique({
      where: { comercio_id: reserva.sucursal.comercio_id },
    });

    if (comercio.usuario_propietario_id !== req.usuario.usuario_id) {
      return res.status(403).json(errorEnvelope("FORBIDDEN", "No eres el dueño de este comercio"));
    }

    await prisma.rETIRO.create({
      data: {
        reserva_id: reserva.reserva_id,
        verificado_por_usuario_id: req.usuario.usuario_id,
        metodo_validacion: metodo_validacion || "CODIGO_MANUAL",
        observacion: observacion || null,
      },
    });

    await prisma.rESERVA.update({
      where: { reserva_id: reserva.reserva_id },
      data: { estado_reserva: "RETIRADA" },
    });

    for (const detalle of reserva.detalles) {
      await prisma.oFERTA_ALIMENTO.update({
        where: { oferta_id: detalle.oferta_id },
        data: { stock_disponible: { decrement: detalle.cantidad } },
      });
    }

    res.json(
      successEnvelope({
        valido: true,
        mensaje: "Retiro validado exitosamente",
      }),
    );
  } catch (err) {
    next(err);
  }
}

async function confirmarRetiro(req, res, next) {
  try {
    const { codigoRetiro } = req.params;
    const codigo = codigoRetiro || req.params.codigoRetiro;

    if (!codigo) {
      return res.status(400).json(errorEnvelope("BAD_REQUEST", "Código de retiro requerido"));
    }

    const reserva = await prisma.rESERVA.findUnique({
      where: { codigo_retiro: codigo },
    });

    if (!reserva) {
      return res.status(404).json(errorEnvelope("NOT_FOUND", "Código de retiro inválido"));
    }

    if (reserva.estado_reserva !== "CONFIRMADA") {
      return res.status(400).json(
        errorEnvelope("BAD_REQUEST", `La reserva está en estado: ${reserva.estado_reserva}`),
      );
    }

    await prisma.rESERVA.update({
      where: { reserva_id: reserva.reserva_id },
      data: { estado_reserva: "RETIRADA" },
    });

    res.json(successEnvelope({ mensaje: "Retiro confirmado exitosamente" }));
  } catch (err) {
    next(err);
  }
}

module.exports = { validarRetiro, confirmarRetiro };