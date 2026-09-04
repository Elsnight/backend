require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const { errorHandler } = require("./middlewares/error.middleware");

const authRoutes = require("./routes/auth.routes");
const ofertasRoutes = require("./routes/ofertas.routes");
const comerciosRoutes = require("./routes/comercios.routes");
const reservasRoutes = require("./routes/reservas.routes");
const retirosRoutes = require("./routes/retiros.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

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

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`RescateFresco API corriendo en puerto ${PORT}`);
});

module.exports = app;