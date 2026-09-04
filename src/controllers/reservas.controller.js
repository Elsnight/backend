// TODO: Implementar creación de reservas y listado de reservas del usuario
function crearReserva(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Crear reserva no implementado" } });
}

function listarMisReservas(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Listar mis reservas no implementado" } });
}

module.exports = { crearReserva, listarMisReservas };