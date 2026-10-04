const { z } = require("zod");

const rolesPublicos = ["CONSUMIDOR", "COMERCIANTE"];

const registroSchema = z
  .object({
    nombres: z.string().trim().min(1).max(100),
    apellidos: z.string().trim().max(100),
    correo: z.string().trim().email().max(150).transform((correo) => correo.toLowerCase()),
    contrasena: z
      .string()
      .min(8)
      .max(255)
      .regex(/[A-Za-z]/, "Debe incluir al menos una letra")
      .regex(/[0-9]/, "Debe incluir al menos un número"),
    rol: z.enum(rolesPublicos).optional(),
    rol_nombre: z.enum(rolesPublicos).optional(),
    rol_id: z.union([z.literal(1), z.literal(2)]).optional(),
    telefono: z.string().max(20).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const roles = [data.rol, data.rol_nombre, data.rol_id].filter((valor) => valor !== undefined);
    if (roles.length !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["rol"],
        message: "Envía exactamente uno de rol, rol_nombre o rol_id",
      });
    }
  })
  .transform((data) => ({
    ...data,
    rol_nombre: data.rol || data.rol_nombre || (data.rol_id === 1 ? "CONSUMIDOR" : "COMERCIANTE"),
  }));

const loginSchema = z.object({
  correo: z.string().trim().email().max(150).transform((correo) => correo.toLowerCase()),
  contrasena: z.string().min(1),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

module.exports = { registroSchema, loginSchema, refreshTokenSchema };
