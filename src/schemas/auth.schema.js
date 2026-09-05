const { z } = require("zod");
const registroSchema = z.object({ email: z.string().email("Invalido"), password: z.string().min(6, "Min 6"), nombre: z.string().min(2), rol: z.enum(["CONSUMIDOR", "COMERCIANTE"]) });
const loginSchema = z.object({ email: z.string().email("Invalido"), password: z.string().min(1) });
module.exports = { registroSchema, loginSchema };
