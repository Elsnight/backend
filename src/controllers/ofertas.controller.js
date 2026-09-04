// TODO: Implementar CRUD de ofertas
function listarOfertas(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Listar ofertas no implementado" } });
}

function obtenerOferta(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Obtener oferta no implementado" } });
}

function crearOferta(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Crear oferta no implementado" } });
}

function actualizarOferta(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Actualizar oferta no implementado" } });
}

function cambiarEstadoOferta(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Cambiar estado oferta no implementado" } });
}

function eliminarOferta(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Eliminar oferta no implementado" } });
}

module.exports = { listarOfertas, obtenerOferta, crearOferta, actualizarOferta, cambiarEstadoOferta, eliminarOferta };