const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main() {
  // Roles
  const roles = [
    { rol_id: 1, nombre: "CONSUMIDOR", descripcion: "Usuario consumidor final" },
    { rol_id: 2, nombre: "COMERCIANTE", descripcion: "Dueño de comercio o administrador de sucursal" },
    { rol_id: 3, nombre: "ADMINISTRADOR", descripcion: "Administrador del sistema" },
  ];

  for (const rol of roles) {
    await prisma.rOL.upsert({
      where: { rol_id: rol.rol_id },
      update: {},
      create: rol,
    });
  }

  // Categorias
  const categorias = [
    { categoria_id: 1, nombre: "Panadería", descripcion: "Pan, pasteles, galletas y repostería" },
    { categoria_id: 2, nombre: "Comidas preparadas", descripcion: "Platos cocinados listos para consumo" },
    { categoria_id: 3, nombre: "Frutas y verduras", descripcion: "Frutas, verduras y hortalizas frescas" },
    { categoria_id: 4, nombre: "Lácteos", descripcion: "Leche, yogur, queso y derivados lácteos" },
    { categoria_id: 5, nombre: "Snacks", descripcion: "Botanas, papas fritas, frutos secos" },
  ];

  for (const cat of categorias) {
    await prisma.cATEGORIA.upsert({
      where: { categoria_id: cat.categoria_id },
      update: {},
      create: cat,
    });
  }

  // Usuarios de prueba
  const hash = await bcrypt.hash("123456", 10);

  const usuarios = [
    {
      correo: "admin@rescatefresco.com",
      nombres: "Admin",
      apellidos: "Sistema",
      rol_id: 3,
      estado_usuario: "ACTIVO",
      hash_contrasena: hash,
    },
    {
      correo: "comerciante@test.com",
      nombres: "Carlos",
      apellidos: "Panadero",
      rol_id: 2,
      estado_usuario: "ACTIVO",
      hash_contrasena: hash,
    },
    {
      correo: "consumidor@test.com",
      nombres: "Ana",
      apellidos: "Compradora",
      rol_id: 1,
      estado_usuario: "ACTIVO",
      hash_contrasena: hash,
    },
  ];

  for (const u of usuarios) {
    await prisma.uSUARIO.upsert({
      where: { correo: u.correo },
      update: {},
      create: u,
    });
  }

  console.log("Seed completado: roles, categorías y usuarios de prueba insertados.");
  console.log("Usuarios de prueba (contraseña: 123456):");
  console.log("  admin@rescatefresco.com     (ADMINISTRADOR)");
  console.log("  comerciante@test.com        (COMERCIANTE)");
  console.log("  consumidor@test.com         (CONSUMIDOR)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());