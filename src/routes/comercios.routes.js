const router = require("express").Router();
const comerciosController = require("../controllers/comercios.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { crearComercioSchema, crearSucursalSchema } = require("../schemas/comercios.schema");

/**
 * @openapi
 * /api/comercios:
 *   post:
 *     tags: [Comercios]
 *     summary: Registrar un nuevo comercio (autenticado)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ruc: { type: string }
 *               razon_social: { type: string }
 *               nombre_comercial: { type: string }
 *               correo_contacto: { type: string }
 *     responses:
 *       201:
 *         description: Comercio creado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post("/", authenticate, validate(crearComercioSchema), comerciosController.crearComercio);

/**
 * @openapi
 * /api/comercios/{id}/sucursales:
 *   post:
 *     tags: [Comercios]
 *     summary: Agregar sucursal a un comercio (autenticado)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string }
 *               direccion: { type: string }
 *               ciudad: { type: string }
 *               latitud: { type: number }
 *               longitud: { type: number }
 *               telefono: { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: Sucursal creada
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Comercio no encontrado
 */
router.post("/:id/sucursales", authenticate, validate(crearSucursalSchema), comerciosController.crearSucursal);

module.exports = router;