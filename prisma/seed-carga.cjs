const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
  const producto = await prisma.pRODUCTO.findFirst({
    include: { comercio: { include: { sucursales: true } } },
  });

  if (!producto || producto.comercio.sucursales.length === 0) {
    throw new Error("Ejecuta primero npm run db:seed para crear el comercio, la sucursal y el producto base");
  }

  const sucursal = producto.comercio.sucursales[0];
  await prisma.oFERTA_ALIMENTO.deleteMany({
    where: { titulo_publico: { startsWith: "[CARGA]" } },
  });

  const ahora = new Date();
  const estados = ["DISPONIBLE", "DISPONIBLE", "DISPONIBLE", "AGOTADA", "PAUSADA", "EXPIRADA"];
  const ofertas = Array.from({ length: 2000 }, (_, index) => {
    const inicioRetiro = new Date(ahora.getTime() + (index % 12) * 60 * 1000);
    const finRetiro = new Date(inicioRetiro.getTime() + (4 + (index % 4)) * 60 * 60 * 1000);
    const fechaVencimiento = new Date(finRetiro.getTime() + 12 * 60 * 60 * 1000);
    const precioOriginal = 4 + (index % 20) * 0.5;
    const stockInicial = 5 + (index % 16);
    const estado = estados[index % estados.length];

    return {
      producto_id: producto.producto_id,
      sucursal_id: sucursal.sucursal_id,
      titulo_publico: `[CARGA] Oferta ${String(index + 1).padStart(4, "0")}`,
      precio_original: precioOriginal,
      precio_oferta: Number((precioOriginal * 0.6).toFixed(2)),
      stock_inicial: stockInicial,
      stock_disponible: estado === "AGOTADA" ? 0 : stockInicial - (index % 3),
      fecha_publicacion: new Date(ahora.getTime() - index * 60 * 1000),
      fecha_vencimiento: fechaVencimiento,
      inicio_retiro: inicioRetiro,
      fin_retiro: finRetiro,
      estado_oferta: estado,
    };
  });

  const resultado = await prisma.oFERTA_ALIMENTO.createMany({ data: ofertas });
  console.log(`${resultado.count} ofertas [CARGA] insertadas`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
