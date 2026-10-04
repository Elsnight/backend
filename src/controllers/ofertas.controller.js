const prisma = require("../lib/prisma");
const { successEnvelope, errorEnvelope } = require("../utils/envelope");

const ofertaCardSelect = {
  oferta_id: true,
  titulo_publico: true,
  precio_original: true,
  precio_oferta: true,
  stock_disponible: true,
  estado_oferta: true,
  fecha_publicacion: true,
  fecha_vencimiento: true,
  fin_retiro: true,
  updated_at: true,
  producto: {
    select: {
      descripcion: true,
      imagen_url: true,
    },
  },
  sucursal: {
    select: {
      sucursal_id: true,
      nombre: true,
      direccion: true,
      latitud: true,
      longitud: true,
      comercio: {
        select: {
          comercio_id: true,
          nombre_comercial: true,
        },
      },
    },
  },
};

function haversine(latitud, longitud, sucursal) {
  const radioTierra = 6371;
  const aRadianes = (valor) => (valor * Math.PI) / 180;
  const latSucursal = Number(sucursal.latitud);
  const lonSucursal = Number(sucursal.longitud);
  const diferenciaLatitud = aRadianes(latSucursal - latitud);
  const diferenciaLongitud = aRadianes(lonSucursal - longitud);
  const a =
    Math.sin(diferenciaLatitud / 2) ** 2 +
    Math.cos(aRadianes(latitud)) *
      Math.cos(aRadianes(latSucursal)) *
      Math.sin(diferenciaLongitud / 2) ** 2;
  return radioTierra * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function mapOferta(oferta, distanciaKm) {
  return {
    id: oferta.oferta_id,
    titulo: oferta.titulo_publico,
    descripcion: oferta.producto.descripcion || "",
    precioOriginal: Number(oferta.precio_original),
    precioOferta: Number(oferta.precio_oferta),
    cantidadDisponible: oferta.stock_disponible,
    stock_disponible: oferta.stock_disponible,
    unidad: "unidad",
    estado: oferta.estado_oferta,
    fin_retiro: oferta.fin_retiro.toISOString(),
    fechaVencimiento: oferta.fecha_vencimiento.toISOString(),
    imagenUrl: oferta.producto.imagen_url || undefined,
    comercio: {
      id: oferta.sucursal.comercio.comercio_id,
      nombre: oferta.sucursal.comercio.nombre_comercial,
      direccion: oferta.sucursal.direccion,
      latitud: Number(oferta.sucursal.latitud),
      longitud: Number(oferta.sucursal.longitud),
    },
    sucursal: {
      id: oferta.sucursal.sucursal_id,
      nombre: oferta.sucursal.nombre,
      latitud: Number(oferta.sucursal.latitud),
      longitud: Number(oferta.sucursal.longitud),
    },
    ...(distanciaKm === undefined ? {} : { distancia_km: Number(distanciaKm.toFixed(2)) }),
    createdAt: oferta.fecha_publicacion.toISOString(),
    updatedAt: oferta.updated_at.toISOString(),
  };
}

async function listarOfertas(req, res, next) {
  try {
    const query = req.validatedQuery;
    const { pagina, limite } = query;
    const where = {};

    if (query.estado) {
      where.estado_oferta = query.estado;
    } else {
      where.estado_oferta = "DISPONIBLE";
      where.stock_disponible = { gt: 0 };
      where.fin_retiro = { gt: new Date() };
    }
    if (query.categoria_id) where.producto = { categoria_id: query.categoria_id };
    if (query.precio_max) where.precio_oferta = { lte: query.precio_max };
    if (query.actualizado_desde) where.updated_at = { gt: query.actualizado_desde };
    if (query.sucursal_id) where.sucursal_id = query.sucursal_id;
    if (query.ciudad) where.sucursal = { ...(where.sucursal || {}), ciudad: { equals: query.ciudad, mode: "insensitive" } };

    let ofertas;
    let total;
    if (query.latitud !== undefined) {
      const deltaLatitud = query.radio / 111.32;
      const coseno = Math.max(Math.cos((query.latitud * Math.PI) / 180), 0.01);
      const deltaLongitud = query.radio / (111.32 * coseno);
      where.sucursal = {
        ...(where.sucursal || {}),
        latitud: { gte: query.latitud - deltaLatitud, lte: query.latitud + deltaLatitud },
        longitud: { gte: query.longitud - deltaLongitud, lte: query.longitud + deltaLongitud },
      };

      const [candidatas] = await Promise.all([
        prisma.oFERTA_ALIMENTO.findMany({ where, select: ofertaCardSelect }),
        prisma.oFERTA_ALIMENTO.count({ where }),
      ]);
      const cercanas = candidatas
        .map((oferta) => ({ oferta, distancia: haversine(query.latitud, query.longitud, oferta.sucursal) }))
        .filter(({ distancia }) => distancia <= query.radio)
        .sort((a, b) => a.distancia - b.distancia);
      total = cercanas.length;
      ofertas = cercanas
        .slice((pagina - 1) * limite, pagina * limite)
        .map(({ oferta, distancia }) => mapOferta(oferta, distancia));
    } else {
      const [registros, cantidad] = await Promise.all([
        prisma.oFERTA_ALIMENTO.findMany({
          where,
          select: ofertaCardSelect,
          orderBy: { fecha_publicacion: "desc" },
          skip: (pagina - 1) * limite,
          take: limite,
        }),
        prisma.oFERTA_ALIMENTO.count({ where }),
      ]);
      ofertas = registros.map((oferta) => mapOferta(oferta));
      total = cantidad;
    }

    res.json(successEnvelope(ofertas, {
      pagina,
      limite,
      total,
      total_paginas: Math.ceil(total / limite),
    }));
  } catch (error) {
    next(error);
  }
}

async function obtenerOferta(req, res, next) {
  try {
    const oferta = await prisma.oFERTA_ALIMENTO.findUnique({
      where: { oferta_id: req.params.id },
      select: ofertaCardSelect,
    });
    if (!oferta) return res.status(404).json(errorEnvelope("NOT_FOUND", "Oferta no encontrada"));
    res.json(successEnvelope(mapOferta(oferta)));
  } catch (error) {
    next(error);
  }
}

async function validarRecursosOferta(usuarioId, productoId, sucursalId) {
  const [producto, sucursal] = await Promise.all([
    prisma.pRODUCTO.findFirst({
      where: { producto_id: productoId, comercio: { usuario_propietario_id: usuarioId } },
      select: { comercio_id: true },
    }),
    prisma.sUCURSAL.findFirst({
      where: { sucursal_id: sucursalId, comercio: { usuario_propietario_id: usuarioId } },
      select: { comercio_id: true },
    }),
  ]);
  return producto && sucursal && producto.comercio_id === sucursal.comercio_id;
}

function validarReglasOferta(data) {
  if (data.precio_oferta >= data.precio_original) return "El precio de oferta debe ser menor al precio original";
  if (data.stock_disponible > data.stock_inicial) return "El stock disponible no puede superar el stock inicial";
  if (new Date(data.inicio_retiro) >= new Date(data.fin_retiro)) return "El inicio de retiro debe ser anterior al fin";
  if (new Date(data.fin_retiro) > new Date(data.fecha_vencimiento)) return "El fin de retiro no puede superar el vencimiento";
  return null;
}

async function crearOferta(req, res, next) {
  try {
    const esPropietario = await validarRecursosOferta(
      req.usuario.usuario_id,
      req.body.producto_id,
      req.body.sucursal_id
    );
    if (!esPropietario) return res.status(403).json(errorEnvelope("FORBIDDEN", "Producto y sucursal deben pertenecer al mismo comercio del usuario"));
    const errorRegla = validarReglasOferta(req.body);
    if (errorRegla) return res.status(422).json(errorEnvelope("INVALID_OFFER", errorRegla));

    const oferta = await prisma.oFERTA_ALIMENTO.create({
      data: { ...req.body, estado_oferta: "DISPONIBLE" },
    });
    res.status(201).json(successEnvelope(oferta));
  } catch (error) {
    next(error);
  }
}

async function actualizarOferta(req, res, next) {
  try {
    const actual = await prisma.oFERTA_ALIMENTO.findUnique({ where: { oferta_id: req.params.id } });
    const tieneReservas = await prisma.dETALLE_RESERVA.count({ where: { oferta_id: req.params.id } });
    if (tieneReservas > 0) return res.status(409).json(errorEnvelope("OFFER_HAS_RESERVATIONS", "No se puede editar una oferta con reservas"));
    const combinada = { ...actual, ...req.body };
    const errorRegla = validarReglasOferta(combinada);
    if (errorRegla) return res.status(422).json(errorEnvelope("INVALID_OFFER", errorRegla));
    const oferta = await prisma.oFERTA_ALIMENTO.update({ where: { oferta_id: req.params.id }, data: req.body });
    res.json(successEnvelope(oferta));
  } catch (error) {
    next(error);
  }
}

async function cambiarEstadoOferta(req, res, next) {
  try {
    const oferta = await prisma.oFERTA_ALIMENTO.update({
      where: { oferta_id: req.params.id },
      data: { estado_oferta: req.body.estado_oferta },
    });
    res.json(successEnvelope(oferta));
  } catch (error) {
    next(error);
  }
}

async function misOfertas(req, res, next) {
  try {
    const { pagina, limite, estado } = req.validatedQuery;
    const where = {
      sucursal: { comercio: { usuario_propietario_id: req.usuario.usuario_id } },
      ...(estado ? { estado_oferta: estado } : {}),
    };
    const [ofertas, total] = await Promise.all([
      prisma.oFERTA_ALIMENTO.findMany({
        where,
        select: ofertaCardSelect,
        orderBy: { fecha_publicacion: "desc" },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.oFERTA_ALIMENTO.count({ where }),
    ]);
    res.json(successEnvelope(ofertas.map((oferta) => mapOferta(oferta)), {
      pagina,
      limite,
      total,
      total_paginas: Math.ceil(total / limite),
    }));
  } catch (error) {
    next(error);
  }
}

async function eliminarOferta(req, res, next) {
  try {
    await prisma.oFERTA_ALIMENTO.update({
      where: { oferta_id: req.params.id },
      data: { estado_oferta: "EXPIRADA" },
    });
    res.json(successEnvelope({ mensaje: "Oferta desactivada" }));
  } catch (error) {
    next(error);
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
