const { z } = require("zod");

const crearReservaSchema = z.object({
  oferta_id: z.string().uuid(),
  cantidad: z.number().int().positive(),
});

module.exports = { crearReservaSchema };