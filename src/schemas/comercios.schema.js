const { z } = require("zod");

const crearComercioSchema = z.object({
  ruc: z.string().min(1).max(13),
  razon_social: z.string().min(1).max(160),
  nombre_comercial: z.string().min(1).max(160),
  correo_contacto: z.string().email().max(150),
});

const crearSucursalSchema = z.object({
  nombre: z.string().min(1).max(120),
  direccion: z.string().min(1).max(255),
  ciudad: z.string().min(1).max(80),
  latitud: z.number().min(-90).max(90),
  longitud: z.number().min(-180).max(180),
  telefono: z.string().max(20).nullable().optional(),
});

module.exports = { crearComercioSchema, crearSucursalSchema };