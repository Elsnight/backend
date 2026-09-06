const { PrismaClient } = require("@prisma/client");
const { successEnvelope, errorEnvelope } = require("../utils/envelope");

const prisma = new PrismaClient();

async function marcarFavorito(req, res, next) {
  try {
    const { comercio_id } = req.body;
    const usuarioId = req.usuario.usuario_id;

    const comercio = await prisma.cOMERCIO.findUnique({
      where: { comercio_id },
    });

    if (!comercio) {
      return res
        .status(404)
        .json(errorEnvelope("NOT_FOUND", "Comercio no encontrado"));
    }

    await prisma.fAVORITO.create({
      data: {
        usuario_id: usuarioId,
        comercio_id,
      },
    });

    return res.status(201).json(
      successEnvelope({
        usuario_id: usuarioId,
        comercio_id,
        marcado: true,
      })
    );
  } catch (err) {
    if (err.code === "P2002") {
      return res
        .status(409)
        .json(errorEnvelope("CONFLICTO", "El favorito ya existe"));
    }
    next(err);
  }
}

async function desmarcarFavorito(req, res, next) {
  try {
    const { comercioId } = req.params;
    const usuarioId = req.usuario.usuario_id;

    await prisma.fAVORITO.delete({
      where: {
        usuario_id_comercio_id: {
          usuario_id: usuarioId,
          comercio_id: comercioId,
        },
      },
    });

    return res.json(
      successEnvelope({
        usuario_id: usuarioId,
        comercio_id: comercioId,
        marcado: false,
      })
    );
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json(errorEnvelope("NOT_FOUND", "Favorito no encontrado"));
    }
    next(err);
  }
}

async function listarFavoritos(req, res, next) {
  try {
    const usuarioId = req.usuario.usuario_id;

    const favoritos = await prisma.fAVORITO.findMany({
      where: { usuario_id: usuarioId },
      include: {
        comercio: {
          select: {
            comercio_id: true,
            nombre_comercial: true,
            ruc: true,
            sucursales: {
              select: { ciudad: true, direccion: true },
            },
          },
        },
      },
      orderBy: { fecha_creacion: "desc" },
    });

    const data = favoritos.map((f) => ({
      id: f.comercio.comercio_id,
      nombre: f.comercio.nombre_comercial,
      ruc: f.comercio.ruc,
      sucursales: f.comercio.sucursales,
      createdAt: f.fecha_creacion.toISOString(),
    }));

    return res.json(successEnvelope(data));
  } catch (err) {
    next(err);
  }
}

module.exports = { marcarFavorito, desmarcarFavorito, listarFavoritos };