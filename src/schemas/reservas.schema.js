const { z } = require("zod");

const crearReservaSchema = z
  .object({
    sucursal_id: z.string().uuid(),
    items: z
      .array(
        z.object({
          oferta_id: z.string().uuid(),
          cantidad: z.number().int().positive(),
        })
      )
      .min(1)
      .max(50),
  })
  .superRefine((data, ctx) => {
    const ids = data.items.map((item) => item.oferta_id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: "custom", path: ["items"], message: "No se puede repetir una oferta" });
    }
  });

module.exports = { crearReservaSchema };
