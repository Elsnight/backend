const { z } = require("zod");

const validarRetiroSchema = z.object({
  codigo_retiro: z.string().trim().min(1).max(12),
  metodo_validacion: z.enum(["QR", "CODIGO_MANUAL"]),
  observacion: z.string().trim().max(300).optional(),
});

module.exports = { validarRetiroSchema };
