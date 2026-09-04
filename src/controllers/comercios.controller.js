// TODO: Implementar creación de comercio y sucursales
function crearComercio(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Crear comercio no implementado" } });
}

function crearSucursal(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Crear sucursal no implementado" } });
}

module.exports = { crearComercio, crearSucursal };