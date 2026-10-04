const { Prisma } = require("@prisma/client");
const { ZodError } = require("zod");
const { errorEnvelope } = require("../utils/envelope");

function errorHandler(error, req, res, next) {
  console.error(error);

  if (error instanceof ZodError) {
    return res.status(400).json(
      errorEnvelope("VALIDATION_ERROR", "Datos inválidos", error.flatten().fieldErrors)
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json(errorEnvelope("CONFLICT", "El recurso ya existe", { campos: error.meta?.target }));
    }
    if (error.code === "P2025") {
      return res.status(404).json(errorEnvelope("NOT_FOUND", "Recurso no encontrado"));
    }
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json(errorEnvelope("INVALID_JSON", "El cuerpo JSON no es válido"));
  }

  const status = error.status || 500;
  if (status >= 500 && process.env.NODE_ENV === "production") {
    return res.status(status).json(errorEnvelope("INTERNAL_ERROR", "Error interno del servidor"));
  }
  return res.status(status).json(
    errorEnvelope(status >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR", error.message || "Error interno del servidor")
  );
}

module.exports = { errorHandler };
