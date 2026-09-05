const { z } = require("zod");

const registroSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  nombre: z.string().min(2, "Nombre requerido"),
  rol: z.enum(["CONSUMIDOR", "COMERCIANTE"]),
});

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

module.exports = { registroSchema, loginSchema };