const router = require("express").Router();
const controller = require("../controllers/productos.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { crearProductoSchema, actualizarProductoSchema } = require("../schemas/productos.schema");

/**
 * @openapi
 * /api/productos/mios:
 *   get:
 *     tags: [Productos]
 *     summary: Listar productos de los comercios propios
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Catálogo propio }
 *       401: { description: Token ausente o inválido }
 *       403: { description: Requiere rol COMERCIANTE }
 */
router.get("/mios", authenticate, authorize("COMERCIANTE"), controller.listarPropios);

/**
 * @openapi
 * /api/productos:
 *   post:
 *     tags: [Productos]
 *     summary: Crear un producto en un comercio propio
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [comercio_id, categoria_id, nombre]
 *             properties:
 *               comercio_id: { type: string, format: uuid }
 *               categoria_id: { type: integer }
 *               nombre: { type: string, maxLength: 150 }
 *               descripcion: { type: string, nullable: true }
 *               informacion_alergenos: { type: string, nullable: true }
 *               imagen_url: { type: string, format: uri, nullable: true }
 *               activo: { type: boolean }
 *     responses:
 *       201: { description: Producto creado }
 *       400: { description: Body inválido }
 *       401: { description: Token ausente o inválido }
 *       403: { description: Comercio ajeno o rol incorrecto }
 *       422: { description: Categoría inexistente }
 */
router.post("/", authenticate, authorize("COMERCIANTE"), validate(crearProductoSchema), controller.crear);

/**
 * @openapi
 * /api/productos/{id}:
 *   put:
 *     tags: [Productos]
 *     summary: Editar un producto propio
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoria_id: { type: integer }
 *               nombre: { type: string }
 *               descripcion: { type: string, nullable: true }
 *               informacion_alergenos: { type: string, nullable: true }
 *               imagen_url: { type: string, format: uri, nullable: true }
 *               activo: { type: boolean }
 *     responses:
 *       200: { description: Producto actualizado }
 *       400: { description: Body inválido }
 *       401: { description: Token ausente o inválido }
 *       403: { description: Producto ajeno o rol incorrecto }
 *       404: { description: Producto inexistente }
 *       422: { description: Categoría inexistente }
 */
router.put("/:id", authenticate, authorize("COMERCIANTE"), validate(actualizarProductoSchema), controller.actualizar);

module.exports = router;
