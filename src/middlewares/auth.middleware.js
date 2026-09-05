const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { errorEnvelope } = require("../utils/envelope");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || "dev-secreto-access-123";

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json(errorEnvelope("UNAUTHORIZED", "Token no proporcionado"));
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch {
    return res
      .status(401)
      .json(errorEnvelope("UNAUTHORIZED", "Token inválido o expirado"));
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res
        .status(401)
        .json(errorEnvelope("UNAUTHORIZED", "No autenticado"));
    }
    if (!roles.includes(req.usuario.rol)) {
      return res
        .status(403)
        .json(errorEnvelope("FORBIDDEN", "No tienes permiso para esta acción"));
    }
    next();
  };
}

function isOwner(model) {
  return async (req, res, next) => {
    if (!req.usuario) {
      return res
        .status(401)
        .json(errorEnvelope("UNAUTHORIZED", "No autenticado"));
    }

    try {
      let resource;
      if (model === "OFERTA") {
        resource = await prisma.oFERTA_ALIMENTO.findUnique({
          where: { oferta_id: req.params.id },
          include: { producto: { select: { comercio_id: true } } },
        });
        if (!resource) {
          return res
            .status(404)
            .json(errorEnvelope("NOT_FOUND", "Oferta no encontrada"));
        }
        const comercio = await prisma.cOMERCIO.findUnique({
          where: { comercio_id: resource.producto.comercio_id },
        });
        if (comercio.usuario_propietario_id !== req.usuario.usuario_id) {
          return res
            .status(403)
            .json(
              errorEnvelope("FORBIDDEN", "No eres el dueño de este recurso")
            );
        }
      } else if (model === "COMERCIO") {
        resource = await prisma.cOMERCIO.findUnique({
          where: { comercio_id: req.params.id },
        });
        if (!resource) {
          return res
            .status(404)
            .json(errorEnvelope("NOT_FOUND", "Comercio no encontrado"));
        }
        if (resource.usuario_propietario_id !== req.usuario.usuario_id) {
          return res
            .status(403)
            .json(
              errorEnvelope("FORBIDDEN", "No eres el dueño de este recurso")
            );
        }
      } else if (model === "SUCURSAL") {
        resource = await prisma.sUCURSAL.findUnique({
          where: { sucursal_id: req.params.id },
        });
        if (!resource) {
          return res
            .status(404)
            .json(errorEnvelope("NOT_FOUND", "Sucursal no encontrada"));
        }
        const comercio = await prisma.cOMERCIO.findUnique({
          where: { comercio_id: resource.comercio_id },
        });
        if (comercio.usuario_propietario_id !== req.usuario.usuario_id) {
          return res
            .status(403)
            .json(
              errorEnvelope("FORBIDDEN", "No eres el dueño de este recurso")
            );
        }
      } else {
        return res
          .status(500)
          .json(errorEnvelope("INTERNAL_ERROR", "Modelo no soportado para isOwner"));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { authenticate, authorize, isOwner };