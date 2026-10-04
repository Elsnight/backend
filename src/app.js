require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const { errorHandler } = require("./middlewares/error.middleware");
const { errorEnvelope } = require("./utils/envelope");

const authRoutes = require("./routes/auth.routes");
const ofertasRoutes = require("./routes/ofertas.routes");
const comerciosRoutes = require("./routes/comercios.routes");
const reservasRoutes = require("./routes/reservas.routes");
const retirosRoutes = require("./routes/retiros.routes");
const adminRoutes = require("./routes/admin.routes");
const favoritosRoutes = require("./routes/favoritos.routes");
const productosRoutes = require("./routes/productos.routes");
const categoriasRoutes = require("./routes/categorias.routes");
const pagosRoutes = require("./routes/pagos.routes");

const app = express();
const PORT = process.env.PORT || 3000;

const corsOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || corsOrigins.includes("*") || corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "RescateFresco API Docs",
}));

app.use("/api/auth", authRoutes);
app.use("/api/ofertas", ofertasRoutes);
app.use("/api/comercios", comerciosRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/retiros", retirosRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/favoritos", favoritosRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/pagos", pagosRoutes);

app.use((req, res) => {
  res.status(404).json(errorEnvelope("NOT_FOUND", "Ruta no encontrada"));
});
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`RescateFresco API corriendo en puerto ${PORT}`);
});

module.exports = app;
