// TODO: Implementar validación con zod y normalización
function validate(schema) {
  return (req, res, next) => {
    res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Middleware validate no implementado" } });
  };
}

module.exports = { validate };