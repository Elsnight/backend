const { z } = require("zod");

const camposProducto = {
  categoria_id: z.number().int().positive(),
  nombre: z.string().trim().min(1).max(150),
  descripcion: z.string().max(5000).nullable().optional(),
  informacion_alergenos: z.string().max(500).nullable().optional(),
  imagen_url: z.string().url().max(500).nullable().optional(),
  activo: z.boolean().optional(),
};

const crearProductoSchema = z.object({
  comercio_id: z.string().uuid(),
  ...camposProducto,
});

const actualizarProductoSchema = z.object(camposProducto).partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Debe enviar al menos un campo" }
);

module.exports = { crearProductoSchema, actualizarProductoSchema };
