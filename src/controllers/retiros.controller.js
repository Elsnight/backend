const prisma = require("../lib/prisma");
const { successEnvelope, errorEnvelope } = require("../utils/envelope");

async function validarRetiro(req, res, next) {
  try {
    const { codigo_retiro, metodo_validacion, observacion } = req.body;

    const reserva = await prisma.rESERVA.findUnique({
      where: { codigo_retiro },
      include: { sucursal: { include: { comercio: true } } },
    });

    if (!reserva) {
      return res
        .status(404)
        .json(errorEnvelope("NOT_FOUND", "Reserva no encontrada con ese código"));
    }

    if (reserva.sucursal.comercio.usuario_propietario_id !== req.usuario.usuario_id) {
      return res
        .status(403)
        .json(errorEnvelope("FORBIDDEN", "No eres el dueño de este comercio"));
    }

    if (reserva.estado_reserva !== "LISTA_RETIRO") {
      return res
        .status(400)
        .json(errorEnvelope("BAD_REQUEST", "La reserva no está lista para retiro"));
    }

    const retiro = await prisma.rETIRO.create({
      data: {
        reserva_id: reserva.reserva_id,
        verificado_por_usuario_id: req.usuario.usuario_id,
        metodo_validacion,
        observacion: observacion || null,
      },
      include: { reserva: true },
    });

    await prisma.rESERVA.update({
      where: { reserva_id: reserva.reserva_id },
      data: { estado_reserva: "RETIRADA" },
    });

    res.status(201).json(successEnvelope({
      retiro_id: retiro.retiro_id,
      reserva_id: retiro.reserva_id,
      fecha_retiro: retiro.fecha_retiro,
      observacion: retiro.observacion,
    }));
  } catch (err) {
    next(err);
  }
}

module.exports = { validarRetiro };