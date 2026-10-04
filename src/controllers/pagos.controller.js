const { randomUUID } = require("node:crypto");
const prisma = require("../lib/prisma");
const { successEnvelope, errorEnvelope } = require("../utils/envelope");

function mapPago(pago) {
  return {
    pago_id: pago.pago_id,
    reserva_id: pago.reserva_id,
    proveedor_pago: pago.proveedor_pago,
    referencia_externa: pago.referencia_externa,
    metodo_pago: pago.metodo_pago,
    monto: Number(pago.monto),
    moneda: pago.moneda,
    estado_pago: pago.estado_pago,
    fecha_proceso: pago.fecha_proceso,
  };
}

async function crear(req, res, next) {
  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const reserva = await tx.rESERVA.findUnique({ where: { reserva_id: req.body.reserva_id } });
      if (!reserva) return { error: [404, "NOT_FOUND", "Reserva no encontrada"] };
      if (reserva.usuario_id !== req.usuario.usuario_id) return { error: [403, "FORBIDDEN", "La reserva no pertenece al usuario"] };
      if (reserva.estado_reserva !== "PENDIENTE_PAGO") {
        return { error: [409, "INVALID_RESERVATION_STATE", "La reserva no está pendiente de pago"] };
      }
      if (new Date() > reserva.fecha_limite_retiro) {
        return { error: [409, "RESERVATION_EXPIRED", "La reserva ya expiró"] };
      }

      const pago = await tx.pAGO.create({
        data: {
          reserva_id: reserva.reserva_id,
          proveedor_pago: "SIMULADO",
          referencia_externa: `SIM-${randomUUID()}`,
          metodo_pago: req.body.metodo_pago,
          monto: reserva.total_pagar,
          moneda: "USD",
          estado_pago: req.body.simular_rechazo ? "RECHAZADO" : "APROBADO",
        },
      });

      if (req.body.simular_rechazo) return { rechazado: true, pago };

      await tx.rESERVA.update({
        where: { reserva_id: reserva.reserva_id },
        data: { estado_reserva: "PAGADA" },
      });
      const reservaActualizada = await tx.rESERVA.update({
        where: { reserva_id: reserva.reserva_id },
        data: { estado_reserva: "LISTA_RETIRO" },
      });
      return { pago, reserva: reservaActualizada };
    });

    if (resultado.error) {
      const [status, code, message] = resultado.error;
      return res.status(status).json(errorEnvelope(code, message));
    }
    if (resultado.rechazado) {
      return res.status(422).json(errorEnvelope("PAYMENT_REJECTED", "Pago rechazado por el simulador", { pago: mapPago(resultado.pago) }));
    }

    res.status(201).json(successEnvelope({
      pago: mapPago(resultado.pago),
      reserva: {
        reserva_id: resultado.reserva.reserva_id,
        estado_reserva: resultado.reserva.estado_reserva,
        codigo_retiro: resultado.reserva.codigo_retiro,
        total_pagar: Number(resultado.reserva.total_pagar),
      },
    }));
  } catch (error) {
    next(error);
  }
}

async function historial(req, res, next) {
  try {
    const reserva = await prisma.rESERVA.findUnique({
      where: { reserva_id: req.params.reservaId },
      select: { usuario_id: true },
    });
    if (!reserva) return res.status(404).json(errorEnvelope("NOT_FOUND", "Reserva no encontrada"));
    if (reserva.usuario_id !== req.usuario.usuario_id) {
      return res.status(403).json(errorEnvelope("FORBIDDEN", "La reserva no pertenece al usuario"));
    }
    const pagos = await prisma.pAGO.findMany({
      where: { reserva_id: req.params.reservaId },
      orderBy: { fecha_proceso: "desc" },
    });
    res.json(successEnvelope(pagos.map(mapPago)));
  } catch (error) {
    next(error);
  }
}

module.exports = { crear, historial };
