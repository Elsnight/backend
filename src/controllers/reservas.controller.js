const prisma = require("../lib/prisma");
const { successEnvelope, errorEnvelope } = require("../utils/envelope");

function generarCodigoRetiro() {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => caracteres[Math.floor(Math.random() * caracteres.length)]).join("");
}

const reservaSelect = {
  reserva_id: true,
  usuario_id: true,
  codigo_retiro: true,
  subtotal: true,
  total_pagar: true,
  estado_reserva: true,
  fecha_reserva: true,
  fecha_limite_retiro: true,
  detalles: {
    select: {
      cantidad: true,
      precio_unitario: true,
      subtotal_linea: true,
      oferta: {
        select: {
          oferta_id: true,
          titulo_publico: true,
          precio_oferta: true,
          producto: { select: { imagen_url: true } },
        },
      },
    },
  },
  sucursal: {
    select: {
      sucursal_id: true,
      nombre: true,
      direccion: true,
      comercio: { select: { comercio_id: true, nombre_comercial: true } },
    },
  },
};

function mapReserva(reserva) {
  const primerDetalle = reserva.detalles?.[0];
  const comercio = {
    id: reserva.sucursal.comercio.comercio_id,
    nombre: reserva.sucursal.comercio.nombre_comercial,
    direccion: reserva.sucursal.direccion,
  };
  const mapDetalle = (detalle) => ({
    oferta_id: detalle.oferta.oferta_id,
    cantidad: detalle.cantidad,
    precio_unitario: Number(detalle.precio_unitario),
    subtotal_linea: Number(detalle.subtotal_linea),
    oferta: {
      id: detalle.oferta.oferta_id,
      titulo: detalle.oferta.titulo_publico,
      precioOferta: Number(detalle.oferta.precio_oferta),
      imagenUrl: detalle.oferta.producto.imagen_url || undefined,
      comercio,
    },
  });

  return {
    id: reserva.reserva_id,
    reserva_id: reserva.reserva_id,
    usuarioId: reserva.usuario_id,
    sucursal_id: reserva.sucursal.sucursal_id,
    ofertaId: primerDetalle?.oferta.oferta_id || "",
    cantidad: primerDetalle?.cantidad || 0,
    codigoRetiro: reserva.codigo_retiro,
    codigo_retiro: reserva.codigo_retiro,
    subtotal: Number(reserva.subtotal),
    total_pagar: Number(reserva.total_pagar),
    estado: reserva.estado_reserva,
    estado_reserva: reserva.estado_reserva,
    fecha_limite_retiro: reserva.fecha_limite_retiro,
    createdAt: reserva.fecha_reserva,
    items: reserva.detalles.map(mapDetalle),
    oferta: primerDetalle ? mapDetalle(primerDetalle).oferta : null,
  };
}

async function crearReserva(req, res, next) {
  try {
    const { sucursal_id: sucursalId, items } = req.body;
    const ids = items.map((item) => item.oferta_id);
    const [sucursal, ofertas] = await Promise.all([
      prisma.sUCURSAL.findUnique({ where: { sucursal_id: sucursalId }, select: { sucursal_id: true, activo: true } }),
      prisma.oFERTA_ALIMENTO.findMany({
        where: { oferta_id: { in: ids } },
        select: {
          oferta_id: true,
          sucursal_id: true,
          precio_oferta: true,
          stock_disponible: true,
          estado_oferta: true,
          fin_retiro: true,
        },
      }),
    ]);

    if (!sucursal || !sucursal.activo) return res.status(404).json(errorEnvelope("BRANCH_NOT_FOUND", "Sucursal no encontrada o inactiva"));
    if (ofertas.length !== ids.length) return res.status(404).json(errorEnvelope("OFFER_NOT_FOUND", "Una o más ofertas no existen"));
    if (ofertas.some((oferta) => oferta.sucursal_id !== sucursalId)) {
      return res.status(409).json(errorEnvelope("BRANCH_MISMATCH", "Todas las ofertas deben pertenecer a la sucursal indicada"));
    }

    const ahora = new Date();
    const ofertaPorId = new Map(ofertas.map((oferta) => [oferta.oferta_id, oferta]));
    for (const item of items) {
      const oferta = ofertaPorId.get(item.oferta_id);
      if (oferta.estado_oferta !== "DISPONIBLE" || oferta.fin_retiro <= ahora || oferta.stock_disponible < item.cantidad) {
        return res.status(409).json(errorEnvelope("STOCK_INSUFICIENTE", "La oferta no está disponible o no tiene stock suficiente", { oferta_id: item.oferta_id }));
      }
    }

    const total = items.reduce(
      (acumulado, item) => acumulado + Number(ofertaPorId.get(item.oferta_id).precio_oferta) * item.cantidad,
      0
    );
    const fechaLimite = new Date(Math.min(...ofertas.map((oferta) => oferta.fin_retiro.getTime())));

    const reserva = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const actualizada = await tx.oFERTA_ALIMENTO.updateMany({
          where: {
            oferta_id: item.oferta_id,
            estado_oferta: "DISPONIBLE",
            stock_disponible: { gte: item.cantidad },
            fin_retiro: { gt: ahora },
          },
          data: { stock_disponible: { decrement: item.cantidad } },
        });
        if (actualizada.count !== 1) {
          const error = new Error("STOCK_INSUFICIENTE");
          error.ofertaId = item.oferta_id;
          throw error;
        }
      }

      return tx.rESERVA.create({
        data: {
          usuario_id: req.usuario.usuario_id,
          sucursal_id: sucursalId,
          codigo_retiro: generarCodigoRetiro(),
          subtotal: total,
          total_pagar: total,
          estado_reserva: "PENDIENTE_PAGO",
          fecha_limite_retiro: fechaLimite,
          detalles: {
            create: items.map((item) => ({
              oferta_id: item.oferta_id,
              cantidad: item.cantidad,
              precio_unitario: Number(ofertaPorId.get(item.oferta_id).precio_oferta),
              subtotal_linea: Number(ofertaPorId.get(item.oferta_id).precio_oferta) * item.cantidad,
            })),
          },
        },
        select: reservaSelect,
      });
    });

    res.status(201).json(successEnvelope(mapReserva(reserva)));
  } catch (error) {
    if (error.message === "STOCK_INSUFICIENTE") {
      return res.status(409).json(errorEnvelope("STOCK_INSUFICIENTE", "El stock cambió durante la reserva", { oferta_id: error.ofertaId }));
    }
    next(error);
  }
}

async function listarMisReservas(req, res, next) {
  try {
    const reservas = await prisma.rESERVA.findMany({
      where: { usuario_id: req.usuario.usuario_id },
      select: reservaSelect,
      orderBy: { fecha_reserva: "desc" },
    });
    res.json(successEnvelope(reservas.map(mapReserva)));
  } catch (error) {
    next(error);
  }
}

async function cancelarReserva(req, res, next) {
  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const reserva = await tx.rESERVA.findUnique({
        where: { reserva_id: req.params.id },
        include: { detalles: true },
      });
      if (!reserva) return { error: [404, "NOT_FOUND", "Reserva no encontrada"] };
      if (reserva.usuario_id !== req.usuario.usuario_id) return { error: [403, "FORBIDDEN", "No eres el dueño de esta reserva"] };
      if (!["PENDIENTE_PAGO", "PAGADA", "LISTA_RETIRO"].includes(reserva.estado_reserva)) {
        return { error: [409, "INVALID_RESERVATION_STATE", "Esta reserva no se puede cancelar"] };
      }

      await Promise.all([
        tx.pAGO.updateMany({
          where: { reserva_id: reserva.reserva_id, estado_pago: "APROBADO" },
          data: { estado_pago: "REVERSADO" },
        }),
        ...reserva.detalles.map((detalle) =>
          tx.oFERTA_ALIMENTO.update({
            where: { oferta_id: detalle.oferta_id },
            data: { stock_disponible: { increment: detalle.cantidad } },
          })
        ),
      ]);

      const actualizada = await tx.rESERVA.update({
        where: { reserva_id: reserva.reserva_id },
        data: { estado_reserva: "CANCELADA", fecha_cancelacion: new Date() },
        select: reservaSelect,
      });
      return { reserva: actualizada };
    });

    if (resultado.error) {
      const [status, code, message] = resultado.error;
      return res.status(status).json(errorEnvelope(code, message));
    }
    res.json(successEnvelope(mapReserva(resultado.reserva)));
  } catch (error) {
    next(error);
  }
}

module.exports = { crearReserva, listarMisReservas, cancelarReserva };
