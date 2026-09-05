const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
dotenv.config();

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main() {
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

  console.log("Seed completed: roles and categories inserted.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());