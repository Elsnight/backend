const prisma = require("../lib/prisma");
const { successEnvelope, errorEnvelope } = require("../utils/envelope");

async function listarOfertas(req, res, next) {
  try {
    const { categoria_id, ciudad, precio_max } = req.query;
    const where = { estado_oferta: "DISPONIBLE" };

    if (categoria_id) {
      where.producto = { categoria_id: parseInt(categoria_id) };
    }
    if (ciudad) {
      where.sucursal = { ciudad };
    }
    if (precio_max) {
      where.precio_oferta = { lte: parseFloat(precio_max) };
    }

    const ofertas = await prisma.oFERTA_ALIMENTO.findMany({
      where,
      include: {
        producto: { include: { categoria: true, comercio: true } },
        sucursal: { include: { comercio: true } },
      },
      orderBy: { fecha_publicacion: "desc" },
    });

    const data = ofertas.map((o) => ({
      id: o.oferta_id,
      titulo: o.titulo_publico,
      descripcion: o.producto.descripcion || "",
      precioOriginal: Number(o.precio_original),
      precioOferta: Number(o.precio_oferta),
      cantidadDisponible: o.stock_disponible,
      unidad: "unidad",
      estado: o.estado_oferta,
      fechaVencimiento: o.fecha_vencimiento.toISOString(),
      imagenUrl: o.producto.imagen_url || undefined,
      comercio: {
        id: o.sucursal.comercio.comercio_id,
        nombre: o.sucursal.comercio.nombre_comercial,
        direccion: o.sucursal.direccion,
        latitud: Number(o.sucursal.latitud),
        longitud: Number(o.sucursal.longitud),
      },
      createdAt: o.fecha_publicacion.toISOString(),
    }));

    res.json(successEnvelope({ data, total: data.length, page: 1, limit: 50 }));
  } catch (err) {
    next(err);
  }
}

async function obtenerOferta(req, res, next) {
  try {
    const oferta = await prisma.oFERTA_ALIMENTO.findUnique({
      where: { oferta_id: req.params.id },
      include: {
        producto: { include: { categoria: true, comercio: true } },
        sucursal: { include: { comercio: true } },
      },
    });

    if (!oferta) {
      return res.status(404).json(errorEnvelope("NOT_FOUND", "Oferta no encontrada"));
    }

    res.json(
      successEnvelope({
        id: oferta.oferta_id,
        titulo: oferta.titulo_publico,
        descripcion: oferta.producto.descripcion || "",
        precioOriginal: Number(oferta.precio_original),
        precioOferta: Number(oferta.precio_oferta),
        cantidadDisponible: oferta.stock_disponible,
        unidad: "unidad",
        estado: oferta.estado_oferta,
        fechaVencimiento: oferta.fecha_vencimiento.toISOString(),
        imagenUrl: oferta.producto.imagen_url || undefined,
        comercio: {
          id: oferta.sucursal.comercio.comercio_id,
          nombre: oferta.sucursal.comercio.nombre_comercial,
          direccion: oferta.sucursal.direccion,
          latitud: Number(oferta.sucursal.latitud),
          longitud: Number(oferta.sucursal.longitud),
        },
        createdAt: oferta.fecha_publicacion.toISOString(),
      })
    );
  } catch (err) {
    next(err);
  }
}

async function crearOferta(req, res, next) {
  try {
    const oferta = await prisma.oFERTA_ALIMENTO.create({
      data: {
        ...req.body,
        estado_oferta: "DISPONIBLE",
      },
      include: {
        producto: true,
        sucursal: { include: { comercio: true } },
      },
    });

    res.status(201).json(successEnvelope(oferta));
  } catch (err) {
    next(err);
  }
}

async function actualizarOferta(req, res, next) {
  try {
    const oferta = await prisma.oFERTA_ALIMENTO.update({
      where: { oferta_id: req.params.id },
      data: req.body,
    });
    res.json(successEnvelope(oferta));
  } catch (err) {
    next(err);
  }
}

async function cambiarEstadoOferta(req, res, next) {
  try {
    const oferta = await prisma.oFERTA_ALIMENTO.update({
      where: { oferta_id: req.params.id },
      data: { estado_oferta: req.body.estado_oferta },
    });
    res.json(successEnvelope(oferta));
  } catch (err) {
    next(err);
  }
}

async function misOfertas(req, res, next) {
  try {
    const ofertas = await prisma.oFERTA_ALIMENTO.findMany({
      where: {
        sucursal: {
          comercio: {
            usuario_propietario_id: req.usuario.usuario_id,
          },
        },
      },
      include: {
        producto: { include: { categoria: true, comercio: true } },
        sucursal: { include: { comercio: true } },
      },
      orderBy: { fecha_publicacion: "desc" },
    });

    const data = ofertas.map((o) => ({
      id: o.oferta_id,
      titulo: o.titulo_publico,
      descripcion: o.producto.descripcion || "",
      precioOriginal: Number(o.precio_original),
      precioOferta: Number(o.precio_oferta),
      cantidadDisponible: o.stock_disponible,
      unidad: "unidad",
      estado: o.estado_oferta,
      fechaVencimiento: o.fecha_vencimiento.toISOString(),
      imagenUrl: o.producto.imagen_url || undefined,
      comercio: {
        id: o.sucursal.comercio.comercio_id,
        nombre: o.sucursal.comercio.nombre_comercial,
        direccion: o.sucursal.direccion,
        latitud: Number(o.sucursal.latitud),
        longitud: Number(o.sucursal.longitud),
      },
      createdAt: o.fecha_publicacion.toISOString(),
    }));

    res.json(successEnvelope(data));
  } catch (err) {
    next(err);
  }
}

async function eliminarOferta(req, res, next) {
  try {
    await prisma.oFERTA_ALIMENTO.update({
      where: { oferta_id: req.params.id },
      data: { estado_oferta: "EXPIRADA" },
    });
    res.json(successEnvelope({ mensaje: "Oferta desactivada" }));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarOfertas,
  obtenerOferta,
  misOfertas,
  crearOferta,
  actualizarOferta,
  cambiarEstadoOferta,
  eliminarOferta,
};