const { z } = require("zod");

const crearPagoSchema = z.object({
  reserva_id: z.string().uuid(),
  metodo_pago: z.enum(["TARJETA", "TRANSFERENCIA", "BILLETERA"]),
  simular_rechazo: z.boolean().optional().default(false),
});

module.exports = { crearPagoSchema };
