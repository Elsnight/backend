const { successEnvelope, errorEnvelope } = require("../utils/envelope");

function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Error interno del servidor";
  res.status(status).json(errorEnvelope("INTERNAL_ERROR", message));
}

module.exports = { errorHandler };