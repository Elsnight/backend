const prisma = require("../lib/prisma");
const { successEnvelope, errorEnvelope } = require("../utils/envelope");

async function verificarCategoria(categoriaId) {
  return prisma.cATEGORIA.findUnique({
    where: { categoria_id: categoriaId },
    select: { categoria_id: true },
  });
}

async function listarPropios(req, res, next) {
  try {
    const productos = await prisma.pRODUCTO.findMany({
      where: { comercio: { usuario_propietario_id: req.usuario.usuario_id } },
      select: {
        producto_id: true,
        comercio_id: true,
        categoria_id: true,
        nombre: true,
        descripcion: true,
        informacion_alergenos: true,
        imagen_url: true,
        activo: true,
        categoria: { select: { nombre: true } },
        comercio: { select: { nombre_comercial: true } },
      },
      orderBy: { nombre: "asc" },
    });
    res.json(successEnvelope(productos));
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const [comercio, categoria] = await Promise.all([
      prisma.cOMERCIO.findFirst({
        where: {
          comercio_id: req.body.comercio_id,
          usuario_propietario_id: req.usuario.usuario_id,
        },
        select: { comercio_id: true },
      }),
      verificarCategoria(req.body.categoria_id),
    ]);
    if (!comercio) return res.status(403).json(errorEnvelope("FORBIDDEN", "El comercio no pertenece al usuario"));
    if (!categoria) return res.status(422).json(errorEnvelope("CATEGORY_NOT_FOUND", "La categoría no existe"));

    const producto = await prisma.pRODUCTO.create({ data: req.body });
    res.status(201).json(successEnvelope(producto));
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const producto = await prisma.pRODUCTO.findUnique({
      where: { producto_id: req.params.id },
      select: { producto_id: true, comercio: { select: { usuario_propietario_id: true } } },
    });
    if (!producto) return res.status(404).json(errorEnvelope("NOT_FOUND", "Producto no encontrado"));
    if (producto.comercio.usuario_propietario_id !== req.usuario.usuario_id) {
      return res.status(403).json(errorEnvelope("FORBIDDEN", "El producto no pertenece al usuario"));
    }
    if (req.body.categoria_id && !(await verificarCategoria(req.body.categoria_id))) {
      return res.status(422).json(errorEnvelope("CATEGORY_NOT_FOUND", "La categoría no existe"));
    }

    const actualizado = await prisma.pRODUCTO.update({
      where: { producto_id: req.params.id },
      data: req.body,
    });
    res.json(successEnvelope(actualizado));
  } catch (error) {
    next(error);
  }
}

module.exports = { listarPropios, crear, actualizar };
