const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
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

  console.log("Roles y categorías insertados.");

  const hash = await bcrypt.hash("123456", 10);

  const usuarioConsumidor = await prisma.uSUARIO.upsert({
    where: { correo: "consumer@test.com" },
    update: {},
    create: {
      rol_id: 1,
      nombres: "María",
      apellidos: "González",
      correo: "consumer@test.com",
      hash_contrasena: hash,
      estado_usuario: "ACTIVO",
    },
  });

  const usuarioComerciante = await prisma.uSUARIO.upsert({
    where: { correo: "comercio@test.com" },
    update: {},
    create: {
      rol_id: 2,
      nombres: "Carlos",
      apellidos: "López",
      correo: "comercio@test.com",
      hash_contrasena: hash,
      estado_usuario: "ACTIVO",
    },
  });

  console.log("Usuarios de prueba creados.");
  console.log("  Consumidor: consumer@test.com / 123456");
  console.log("  Comerciante: comercio@test.com / 123456");

  const comercio = await prisma.cOMERCIO.upsert({
    where: { ruc: "1790012345001" },
    update: {},
    create: {
      usuario_propietario_id: usuarioComerciante.usuario_id,
      ruc: "1790012345001",
      razon_social: "Panadería El Pan Fresco S.A.",
      nombre_comercial: "Panadería El Pan Fresco",
      correo_contacto: "info@panfresco.com",
      estado_comercio: "ACTIVO",
    },
  });

  const sucursal = await prisma.sUCURSAL.upsert({
    where: { comercio_id_nombre: { comercio_id: comercio.comercio_id, nombre: "Centro" } },
    update: {},
    create: {
      comercio_id: comercio.comercio_id,
      nombre: "Centro",
      direccion: "Av. Amazonas y Naciones Unidas",
      ciudad: "Quito",
      latitud: -0.1807,
      longitud: -78.4678,
      telefono: "022345678",
    },
  });

  console.log("Comercio y sucursal creados.");

  const producto = await prisma.pRODUCTO.upsert({
    where: { producto_id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      producto_id: "00000000-0000-0000-0000-000000000001",
      comercio_id: comercio.comercio_id,
      categoria_id: 1,
      nombre: "Pan de yema artesanal",
      descripcion: "Pan de yema horneado esta mañana, receta tradicional con masa madre.",
      informacion_alergenos: "Contiene gluten, huevo, lácteos.",
      activo: true,
    },
  });

  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  const oferta1 = await prisma.oFERTA_ALIMENTO.upsert({
    where: { oferta_id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      oferta_id: "00000000-0000-0000-0000-000000000001",
      producto_id: producto.producto_id,
      sucursal_id: sucursal.sucursal_id,
      titulo_publico: "Pan de yema artesanal - 6 unidades",
      precio_original: 5.0,
      precio_oferta: 2.5,
      stock_inicial: 10,
      stock_disponible: 10,
      fecha_vencimiento: manana,
      inicio_retiro: hoy,
      fin_retiro: new Date(hoy.getTime() + 6 * 60 * 60 * 1000),
      estado_oferta: "DISPONIBLE",
    },
  });

  const oferta2 = await prisma.oFERTA_ALIMENTO.upsert({
    where: { oferta_id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      oferta_id: "00000000-0000-0000-0000-000000000002",
      producto_id: producto.producto_id,
      sucursal_id: sucursal.sucursal_id,
      titulo_publico: "Croissants de mantequilla - 4 unidades",
      precio_original: 6.0,
      precio_oferta: 3.0,
      stock_inicial: 8,
      stock_disponible: 8,
      fecha_vencimiento: manana,
      inicio_retiro: hoy,
      fin_retiro: new Date(hoy.getTime() + 6 * 60 * 60 * 1000),
      estado_oferta: "DISPONIBLE",
    },
  });

  const oferta3 = await prisma.oFERTA_ALIMENTO.upsert({
    where: { oferta_id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      oferta_id: "00000000-0000-0000-0000-000000000003",
      producto_id: producto.producto_id,
      sucursal_id: sucursal.sucursal_id,
      titulo_publico: "Pastel de chocolate artesanal",
      precio_original: 12.0,
      precio_oferta: 5.0,
      stock_inicial: 3,
      stock_disponible: 3,
      fecha_vencimiento: manana,
      inicio_retiro: hoy,
      fin_retiro: new Date(hoy.getTime() + 4 * 60 * 60 * 1000),
      estado_oferta: "DISPONIBLE",
    },
  });

  console.log("Ofertas de prueba creadas.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());