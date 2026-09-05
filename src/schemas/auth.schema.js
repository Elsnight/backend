const { z } = require("zod");

// Schema for user registration
const registroSchema = z.object({
  nombres: z.string().min(1).max(100),
  apellidos: z.string().min(1).max(100),
  correo: z.string().email().max(150),
  contrasena: z.string().min(6).max(255),
  rol_id: z.number().int().positive(),
  telefono: z.string().max(20).nullable().optional(),
});

// Schema for login
const loginSchema = z.object({
  correo: z.string().email().max(150),
  contrasena: z.string().min(1),
});

// Schema for refresh token
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

module.exports = { registroSchema, loginSchema, refreshTokenSchema };