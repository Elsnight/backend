const prisma = require("../lib/prisma");
const { successEnvelope, errorEnvelope } = require("../utils/envelope");

async function validarRetiro(req, res, next) {
  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const reserva = await tx.rESERVA.findUnique({
        where: { codigo_retiro: req.body.codigo_retiro },
        select: {
          reserva_id: true,
          codigo_retiro: true,
          estado_reserva: true,
          total_pagar: true,
          fecha_limite_retiro: true,
          usuario: {
            select: { usuario_id: true, nombres: true, apellidos: true, correo: true },
          },
          sucursal: {
            select: {
              nombre: true,
              comercio: { select: { usuario_propietario_id: true, nombre_comercial: true } },
            },
          },
          detalles: {
            select: {
              cantidad: true,
              precio_unitario: true,
              subtotal_linea: true,
              oferta: { select: { oferta_id: true, titulo_publico: true } },
            },
          },
        },
      });

      if (!reserva) return { error: [404, "NOT_FOUND", "Código de retiro no encontrado"] };
      if (reserva.sucursal.comercio.usuario_propietario_id !== req.usuario.usuario_id) {
        return { error: [403, "FORBIDDEN", "La sucursal no pertenece al comerciante"] };
      }
      if (reserva.estado_reserva !== "LISTA_RETIRO") {
        return { error: [409, "INVALID_RESERVATION_STATE", `La reserva está en estado ${reserva.estado_reserva}`] };
      }

      const pagoAprobado = await tx.pAGO.findFirst({
        where: { reserva_id: reserva.reserva_id, estado_pago: "APROBADO" },
        select: { pago_id: true },
      });
      if (!pagoAprobado) return { error: [409, "APPROVED_PAYMENT_REQUIRED", "La reserva no tiene un pago aprobado"] };
      if (new Date() > reserva.fecha_limite_retiro) {
        return { error: [422, "RETIRO_VENCIDO", "La fecha límite de retiro ya venció"] };
      }

      const transicion = await tx.rESERVA.updateMany({
        where: { reserva_id: reserva.reserva_id, estado_reserva: "LISTA_RETIRO" },
        data: { estado_reserva: "RETIRADA" },
      });
      if (transicion.count !== 1) {
        return { error: [409, "INVALID_RESERVATION_STATE", "La reserva ya fue procesada"] };
      }

      const retiro = await tx.rETIRO.create({
        data: {
          reserva_id: reserva.reserva_id,
          verificado_por_usuario_id: req.usuario.usuario_id,
          metodo_validacion: req.body.metodo_validacion,
          observacion: req.body.observacion || null,
        },
      });
      return { retiro, reserva };
    });

    if (resultado.error) {
      const [status, code, message] = resultado.error;
      return res.status(status).json(errorEnvelope(code, message));
    }

    const { retiro, reserva } = resultado;
    res.status(201).json(successEnvelope({
      retiro: {
        retiro_id: retiro.retiro_id,
        metodo_validacion: retiro.metodo_validacion,
        fecha_retiro: retiro.fecha_retiro,
        observacion: retiro.observacion,
      },
      reserva: {
        reserva_id: reserva.reserva_id,
        codigo_retiro: reserva.codigo_retiro,
        estado_reserva: "RETIRADA",
        total_pagar: Number(reserva.total_pagar),
        consumidor: reserva.usuario,
        comercio: reserva.sucursal.comercio.nombre_comercial,
        sucursal: reserva.sucursal.nombre,
        items: reserva.detalles.map((detalle) => ({
          oferta_id: detalle.oferta.oferta_id,
          titulo: detalle.oferta.titulo_publico,
          cantidad: detalle.cantidad,
          precio_unitario: Number(detalle.precio_unitario),
          subtotal_linea: Number(detalle.subtotal_linea),
        })),
      },
    }));
  } catch (error) {
    next(error);
  }
}

module.exports = { validarRetiro };
