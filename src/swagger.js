const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RescateFresco API",
      version: "1.0.0",
      description:
        "API de economía circular contra el desperdicio de alimentos. Conecta comercios con excedentes de comida y consumidores que compran a precio reducido.",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Servidor local de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                details: { type: "object", nullable: true },
              },
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
            meta: { type: "object" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;