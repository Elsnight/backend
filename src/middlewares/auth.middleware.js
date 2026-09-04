// TODO: Implementar verificación de JWT
function authenticate(req, res, next) {
  res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Middleware authenticate no implementado" } });
}

// TODO: Implementar autorización por rol (recibe string o array de roles)
function authorize(...roles) {
  return (req, res, next) => {
    res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Middleware authorize no implementado" } });
  };
}

// TODO: Verificar que el comerciante es dueño del recurso
function isOwner(model) {
  return (req, res, next) => {
    res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Middleware isOwner no implementado" } });
  };
}

module.exports = { authenticate, authorize, isOwner };