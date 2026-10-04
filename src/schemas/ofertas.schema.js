const { z } = require("zod");

const enteroPositivo = z.coerce.number().int().positive();
const numeroPositivo = z.coerce.number().positive();
const estadosOferta = ["DISPONIBLE", "AGOTADA", "PAUSADA", "EXPIRADA"];

const listarOfertasQuerySchema = z
  .object({
    pagina: enteroPositivo.max(100000).optional(),
    limite: enteroPositivo.max(50).optional(),
    page: enteroPositivo.max(100000).optional(),
    limit: enteroPositivo.max(50).optional(),
    categoria_id: z.coerce.number().int().positive().optional(),
    sucursal_id: z.string().uuid().optional(),
    ciudad: z.string().trim().min(1).max(80).optional(),
    precio_max: numeroPositivo.optional(),
    actualizado_desde: z.coerce.date().optional(),
    estado: z.enum(estadosOferta).optional(),
    latitud: z.coerce.number().min(-90).max(90).optional(),
    longitud: z.coerce.number().min(-180).max(180).optional(),
    radio: numeroPositivo.max(50).default(5),
  })
  .superRefine((data, ctx) => {
    if ((data.latitud === undefined) !== (data.longitud === undefined)) {
      ctx.addIssue({
        code: "custom",
        path: data.latitud === undefined ? ["latitud"] : ["longitud"],
        message: "latitud y longitud deben enviarse juntas",
      });
    }
  })
  .transform((data) => ({
    ...data,
    pagina: data.pagina ?? data.page ?? 1,
    limite: data.limite ?? data.limit ?? 20,
  }));

const misOfertasQuerySchema = z
  .object({
    pagina: enteroPositivo.max(100000).optional(),
    limite: enteroPositivo.max(50).optional(),
    page: enteroPositivo.max(100000).optional(),
    limit: enteroPositivo.max(50).optional(),
    estado: z.enum(estadosOferta).optional(),
  })
  .transform((data) => ({
    ...data,
    pagina: data.pagina ?? data.page ?? 1,
    limite: data.limite ?? data.limit ?? 20,
  }));

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

module.exports = {
  listarOfertasQuerySchema,
  misOfertasQuerySchema,
  crearOfertaSchema,
  actualizarOfertaSchema,
  cambiarEstadoSchema,
};
