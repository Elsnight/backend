const { z } = require("zod");

const crearOfertaSchema = z.object({
  producto_id: z.string(),
  sucursal_id: z.string(),
  titulo_publico: z.string().min(3).max(160),
  precio_original: z.number().positive(),
  precio_oferta: z.number().positive(),
  stock_inicial: z.number().int().positive(),
  stock_disponible: z.number().int().positive(),
  fecha_vencimiento: z.string().datetime({ offset: true }),
  inicio_retiro: z.string().datetime({ offset: true }),
  fin_retiro: z.string().datetime({ offset: true }),
});

const actualizarOfertaSchema = z.object({
  titulo_publico: z.string().min(3).max(160).optional(),
  precio_original: z.number().positive().optional(),
  precio_oferta: z.number().positive().optional(),
  stock_disponible: z.number().int().positive().optional(),
  fecha_vencimiento: z.string().datetime({ offset: true }).optional(),
  inicio_retiro: z.string().datetime({ offset: true }).optional(),
  fin_retiro: z.string().datetime({ offset: true }).optional(),
});

const cambiarEstadoSchema = z.object({
  estado_oferta: z.enum(["DISPONIBLE", "PAUSADA", "AGOTADA", "EXPIRADA"]),
});

module.exports = { crearOfertaSchema, actualizarOfertaSchema, cambiarEstadoSchema };