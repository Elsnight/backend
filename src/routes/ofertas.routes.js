const router = require("express").Router();
const ofertasController = require("../controllers/ofertas.controller");
const { authenticate, authorize, isOwner } = require("../middlewares/auth.middleware");
const { validate, validateQuery } = require("../middlewares/validate.middleware");
const {
  listarOfertasQuerySchema,
  misOfertasQuerySchema,
  crearOfertaSchema,
  actualizarOfertaSchema,
  cambiarEstadoSchema,
} = require("../schemas/ofertas.schema");

/**
 * @openapi
 * /api/ofertas:
 *   get:
 *     tags: [Ofertas]
 *     summary: Listar y filtrar ofertas
 *     parameters:
 *       - { in: query, name: pagina, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limite, schema: { type: integer, minimum: 1, maximum: 50, default: 20 } }
 *       - { in: query, name: page, description: Alias de pagina, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: limit, description: Alias de limite, schema: { type: integer, minimum: 1, maximum: 50 } }
 *       - { in: query, name: categoria_id, schema: { type: integer } }
 *       - { in: query, name: sucursal_id, schema: { type: string, format: uuid } }
 *       - { in: query, name: ciudad, schema: { type: string } }
 *       - { in: query, name: precio_max, schema: { type: number, exclusiveMinimum: 0 } }
 *       - { in: query, name: actualizado_desde, schema: { type: string, format: date-time } }
 *       - { in: query, name: estado, schema: { type: string, enum: [DISPONIBLE, AGOTADA, PAUSADA, EXPIRADA] } }
 *       - { in: query, name: latitud, schema: { type: number, minimum: -90, maximum: 90 } }
 *       - { in: query, name: longitud, schema: { type: number, minimum: -180, maximum: 180 } }
 *       - { in: query, name: radio, description: Radio en km, schema: { type: number, maximum: 50, default: 5 } }
 *     responses:
 *       200:
 *         description: Ofertas y metadatos de paginación
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { type: object } }
 *                     meta:
 *                       type: object
 *                       properties:
 *                         pagina: { type: integer }
 *                         limite: { type: integer }
 *                         total: { type: integer }
 *                         total_paginas: { type: integer }
 *       400: { description: Query inválido, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.get("/", validateQuery(listarOfertasQuerySchema), ofertasController.listarOfertas);

/**
 * @openapi
 * /api/ofertas/mias:
 *   get:
 *     tags: [Ofertas]
 *     summary: Listar ofertas del comerciante, incluidos todos sus estados
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: pagina, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limite, schema: { type: integer, minimum: 1, maximum: 50, default: 20 } }
 *       - { in: query, name: estado, schema: { type: string, enum: [DISPONIBLE, AGOTADA, PAUSADA, EXPIRADA] } }
 *     responses:
 *       200: { description: Ofertas propias paginadas }
 *       400: { description: Query inválido }
 *       401: { description: Token ausente o inválido }
 *       403: { description: Rol no permitido }
 */
router.get(
  "/mias",
  authenticate,
  authorize("COMERCIANTE"),
  validateQuery(misOfertasQuerySchema),
  ofertasController.misOfertas
);

/**
 * @openapi
 * /api/ofertas/{id}:
 *   get:
 *     tags: [Ofertas]
 *     summary: Obtener el detalle público de una oferta
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Detalle de la oferta }
 *       404: { description: Oferta no encontrada }
 */
router.get("/:id", ofertasController.obtenerOferta);

/**
 * @openapi
 * /api/ofertas:
 *   post:
 *     tags: [Ofertas]
 *     summary: Crear una oferta con recursos del comerciante
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [producto_id, sucursal_id, titulo_publico, precio_original, precio_oferta, stock_inicial, stock_disponible, fecha_vencimiento, inicio_retiro, fin_retiro]
 *             properties:
 *               producto_id: { type: string, format: uuid }
 *               sucursal_id: { type: string, format: uuid }
 *               titulo_publico: { type: string, minLength: 3, maxLength: 160 }
 *               precio_original: { type: number, exclusiveMinimum: 0 }
 *               precio_oferta: { type: number, exclusiveMinimum: 0 }
 *               stock_inicial: { type: integer, minimum: 1 }
 *               stock_disponible: { type: integer, minimum: 1 }
 *               fecha_vencimiento: { type: string, format: date-time }
 *               inicio_retiro: { type: string, format: date-time }
 *               fin_retiro: { type: string, format: date-time }
 *     responses:
 *       201: { description: Oferta creada }
 *       400: { description: Tipos o campos inválidos }
 *       401: { description: Token ausente o inválido }
 *       403: { description: Rol o recursos ajenos }
 *       422: { description: Reglas de precio, stock o fechas incumplidas }
 */
router.post("/", authenticate, authorize("COMERCIANTE"), validate(crearOfertaSchema), ofertasController.crearOferta);

/**
 * @openapi
 * /api/ofertas/{id}:
 *   put:
 *     tags: [Ofertas]
 *     summary: Editar una oferta propia sin reservas
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
 *               titulo_publico: { type: string }
 *               precio_original: { type: number }
 *               precio_oferta: { type: number }
 *               stock_disponible: { type: integer }
 *               fecha_vencimiento: { type: string, format: date-time }
 *               inicio_retiro: { type: string, format: date-time }
 *               fin_retiro: { type: string, format: date-time }
 *     responses:
 *       200: { description: Oferta actualizada }
 *       400: { description: Body inválido }
 *       401: { description: Token ausente o inválido }
 *       403: { description: Oferta ajena }
 *       404: { description: Oferta inexistente }
 *       409: { description: La oferta tiene reservas }
 *       422: { description: Reglas de negocio incumplidas }
 */
router.put("/:id", authenticate, authorize("COMERCIANTE"), isOwner("OFERTA"), validate(actualizarOfertaSchema), ofertasController.actualizarOferta);

/**
 * @openapi
 * /api/ofertas/{id}/estado:
 *   patch:
 *     tags: [Ofertas]
 *     summary: Cambiar el estado de una oferta propia
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado_oferta]
 *             properties:
 *               estado_oferta: { type: string, enum: [DISPONIBLE, AGOTADA, PAUSADA, EXPIRADA] }
 *     responses:
 *       200: { description: Estado actualizado }
 *       400: { description: Estado inválido }
 *       401: { description: Token ausente o inválido }
 *       403: { description: Oferta ajena }
 *       404: { description: Oferta inexistente }
 */
router.patch("/:id/estado", authenticate, authorize("COMERCIANTE"), isOwner("OFERTA"), validate(cambiarEstadoSchema), ofertasController.cambiarEstadoOferta);

/**
 * @openapi
 * /api/ofertas/{id}:
 *   delete:
 *     tags: [Ofertas]
 *     summary: Desactivar una oferta propia
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Oferta marcada como EXPIRADA }
 *       401: { description: Token ausente o inválido }
 *       403: { description: Oferta ajena }
 *       404: { description: Oferta inexistente }
 */
router.delete("/:id", authenticate, authorize("COMERCIANTE"), isOwner("OFERTA"), ofertasController.eliminarOferta);

module.exports = router;
