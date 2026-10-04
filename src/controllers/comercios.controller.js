const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { successEnvelope, errorEnvelope } = require("../utils/envelope");

async function crearComercio(req, res, next) {
  try {
    const { ruc, razon_social, nombre_comercial, correo_contacto } = req.body;

    const existente = await prisma.cOMERCIO.findUnique({ where: { ruc } });
    if (existente) {
      return res
        .status(409)
        .json(errorEnvelope("CONFLICT", "El RUC ya está registrado"));
    }

    const comercio = await prisma.cOMERCIO.create({
      data: {
        usuario_propietario_id: req.usuario.usuario_id,
        ruc,
        razon_social,
        nombre_comercial,
        correo_contacto,
        estado_comercio: "PENDIENTE_VALIDACION",
      },
    });

    res.status(201).json(successEnvelope(comercio));
  } catch (err) {
    next(err);
  }
}

async function crearSucursal(req, res, next) {
  try {
    const comercioId = req.params.id;

    const comercio = await prisma.cOMERCIO.findUnique({
      where: { comercio_id: comercioId },
    });

    if (!comercio) {
      return res
        .status(404)
        .json(errorEnvelope("NOT_FOUND", "Comercio no encontrado"));
    }

    if (comercio.usuario_propietario_id !== req.usuario.usuario_id) {
      return res
        .status(403)
        .json(errorEnvelope("FORBIDDEN", "No eres el dueño de este comercio"));
    }

    const { nombre, direccion, ciudad, latitud, longitud, telefono } = req.body;

    const sucursal = await prisma.sUCURSAL.create({
      data: {
        comercio_id: comercioId,
        nombre,
        direccion,
        ciudad,
        latitud,
        longitud,
        telefono: telefono || null,
      },
    });

    res.status(201).json(successEnvelope(sucursal));
  } catch (err) {
    next(err);
  }
}

async function misComercios(req, res, next) {
  try {
    const comercios = await prisma.cOMERCIO.findMany({
      where: { usuario_propietario_id: req.usuario.usuario_id },
      select: {
        comercio_id: true,
        ruc: true,
        razon_social: true,
        nombre_comercial: true,
        correo_contacto: true,
        estado_comercio: true,
        sucursales: {
          where: { activo: true },
          select: {
            sucursal_id: true,
            nombre: true,
            direccion: true,
            ciudad: true,
            latitud: true,
            longitud: true,
            telefono: true,
          },
        },
      },
      orderBy: { fecha_registro: "desc" },
    });
    res.json(successEnvelope(comercios));
  } catch (error) {
    next(error);
  }
}

module.exports = { crearComercio, crearSucursal, misComercios };
