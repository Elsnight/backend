const prisma = require("../lib/prisma");
const { successEnvelope } = require("../utils/envelope");

async function listar(req, res, next) {
  try {
    const categorias = await prisma.cATEGORIA.findMany({
      where: { activa: true },
      select: { categoria_id: true, nombre: true, descripcion: true },
      orderBy: { nombre: "asc" },
    });
    res.json(successEnvelope(categorias));
  } catch (error) {
    next(error);
  }
}

module.exports = { listar };
