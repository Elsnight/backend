const prisma = require("../lib/prisma");
const crypto = require("crypto");
const { successEnvelope, errorEnvelope } = require("../utils/envelope");

function generarCodigoRetiro() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";
  for (let i = 0; i < 8; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

const reservaSelect = {
  reserva_id: true,
  usuario_id: true,
  codigo_retiro: true,
  total_pagar: true,
  estado_reserva: true,
  fecha_reserva: true,
  fecha_limite_retiro: true,
  detalles: {
    select: {
      cantidad: true,
      precio_unitario: true,
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

function mapReserva(r) {
  const detalle = r.detalles?.[0];
  return {
    id: r.reserva_id,
    usuarioId: r.usuario_id,
    ofertaId: detalle?.oferta?.oferta_id ?? "",
    cantidad: detalle?.cantidad ?? 0,
    codigoRetiro: r.codigo_retiro,
    estado: r.estado_reserva,
    createdAt: r.fecha_reserva,
    oferta: {
      id: detalle?.oferta?.oferta_id ?? "",
      titulo: detalle?.oferta?.titulo_publico ?? "",
      precioOferta: Number(detalle?.oferta?.precio_oferta ?? 0),
      imagenUrl: detalle?.oferta?.producto?.imagen_url,
      comercio: {
        id: r.sucursal.comercio.comercio_id,
        nombre: r.sucursal.comercio.nombre_comercial,
        direccion: r.sucursal.direccion,
      },
    },
  };
}

async function crearReserva(req, res, next) {
  try {
    const { oferta_id, cantidad } = req.body;

    const oferta = await prisma.oFERTA_ALIMENTO.findUnique({
      where: { oferta_id },
      include: { sucursal: true },
    });

    if (!oferta) {
      return res.status(404).json(errorEnvelope("NOT_FOUND", "Oferta no encontrada"));
    }

    if (oferta.estado_oferta !== "DISPONIBLE" || oferta.stock_disponible < cantidad) {
      return res.status(400).json(
        errorEnvelope("BAD_REQUEST", "La oferta no está disponible o no hay suficiente stock"),
      );
    }

    const codigo = generarCodigoRetiro();
    const fechaLimite = new Date(oferta.fin_retiro);
    const total = Number(oferta.precio_oferta) * cantidad;

    const reserva = await prisma.rESERVA.create({
      data: {
        usuario_id: req.usuario.usuario_id,
        sucursal_id: oferta.sucursal_id,
        codigo_retiro: codigo,
        subtotal: Number(oferta.precio_oferta) * cantidad,
        total_pagar: total,
        estado_reserva: "PENDIENTE_PAGO",
        fecha_limite_retiro: fechaLimite,
        detalles: {
          create: {
            oferta_id,
            cantidad,
            precio_unitario: Number(oferta.precio_oferta),
            subtotal_linea: total,
          },
        },
      },
      select: reservaSelect,
    });

    await prisma.oFERTA_ALIMENTO.update({
      where: { oferta_id },
      data: { stock_disponible: { decrement: cantidad } },
    });

    res.status(201).json(successEnvelope(mapReserva(reserva)));
  } catch (err) {
    next(err);
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
  } catch (err) {
    next(err);
  }
}

async function cancelarReserva(req, res, next) {
  try {
    const reserva = await prisma.rESERVA.findUnique({
      where: { reserva_id: req.params.id },
      include: { detalles: true },
    });

    if (!reserva) {
      return res.status(404).json(errorEnvelope("NOT_FOUND", "Reserva no encontrada"));
    }

    if (reserva.usuario_id !== req.usuario.usuario_id) {
      return res.status(403).json(errorEnvelope("FORBIDDEN", "No eres el dueño de esta reserva"));
    }

    if (!["PENDIENTE_PAGO"].includes(reserva.estado_reserva)) {
      return res.status(400).json(errorEnvelope("BAD_REQUEST", "Esta reserva no se puede cancelar"));
    }

    const updated = await prisma.rESERVA.update({
      where: { reserva_id: req.params.id },
      data: {
        estado_reserva: "CANCELADA",
        fecha_cancelacion: new Date(),
      },
      select: reservaSelect,
    });

    for (const detalle of reserva.detalles) {
      await prisma.oFERTA_ALIMENTO.update({
        where: { oferta_id: detalle.oferta_id },
        data: { stock_disponible: { increment: detalle.cantidad } },
      });
    }

    res.json(successEnvelope(mapReserva(updated)));
  } catch (err) {
    next(err);
  }
}

module.exports = { crearReserva, listarMisReservas, cancelarReserva };