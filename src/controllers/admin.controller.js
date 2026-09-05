const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { successEnvelope, errorEnvelope } = require("../utils/envelope");

async function listarPendientes(req, res, next) {
  try {
    const comercios = await prisma.cOMERCIO.findMany({
      where: { estado_comercio: "PENDIENTE_VALIDACION" },
      include: {
        propietario: {
          select: { nombres: true, apellidos: true, correo: true, telefono: true },
        },
      },
      orderBy: { fecha_registro: "desc" },
    });

    res.json(successEnvelope(comercios));
  } catch (err) {
    next(err);
  }
}

async function cambiarEstadoComercio(req, res, next) {
  try {
    const { id } = req.params;
    const { estado_comercio } = req.body;

    if (!["ACTIVO", "SUSPENDIDO"].includes(estado_comercio)) {
      return res
        .status(400)
        .json(errorEnvelope("VALIDATION_ERROR", "Estado inválido. Use ACTIVO o SUSPENDIDO"));
    }

    const comercio = await prisma.cOMERCIO.findUnique({
      where: { comercio_id: id },
    });

    if (!comercio) {
      return res
        .status(404)
        .json(errorEnvelope("NOT_FOUND", "Comercio no encontrado"));
    }

    if (comercio.estado_comercio !== "PENDIENTE_VALIDACION" && estado_comercio === "ACTIVO") {
      return res
        .status(400)
        .json(errorEnvelope("BAD_REQUEST", "Solo comercios pendientes pueden ser activados"));
    }

    const updated = await prisma.cOMERCIO.update({
      where: { comercio_id: id },
      data: { estado_comercio },
    });

    res.json(successEnvelope(updated));
  } catch (err) {
    next(err);
  }
}

module.exports = { listarPendientes, cambiarEstadoComercio };