// TODO: Implementar validación de retiro (verificar código, marcar retirado)
function validarRetiro(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Validar retiro no implementado" } });
}

module.exports = { validarRetiro };