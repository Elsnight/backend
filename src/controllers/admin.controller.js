// TODO: Implementar listado de comercios pendientes y cambio de estado
function listarPendientes(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Listar comercios pendientes no implementado" } });
}

function cambiarEstadoComercio(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Cambiar estado comercio no implementado" } });
}

module.exports = { listarPendientes, cambiarEstadoComercio };