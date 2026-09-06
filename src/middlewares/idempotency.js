const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function idempotency() {
  return (req, res, next) => {
    const key = req.headers["idempotency-key"];
    if (!key) return next();

    if (!req.usuario || !req.usuario.usuario_id) {
      return next();
    }

    const endpoint = req.originalUrl || req.baseUrl + (req.route ? req.route.path : "");
    const usuarioId = req.usuario.usuario_id;

    prisma.iDEMPOTENCY_RECORD
      .findUnique({
        where: {
          idempotency_key_endpoint_usuario_id: {
            idempotency_key: key,
            endpoint,
            usuario_id: usuarioId,
          },
        },
      })
      .then((record) => {
        if (record) {
          const saved = record.respuesta_guardada;
          return res.status(record.codigo_estado).json(saved);
        }

        const originalJson = res.json.bind(res);
        res.json = (body) => {
          prisma.iDEMPOTENCY_RECORD
            .create({
              data: {
                idempotency_key: key,
                endpoint,
                usuario_id: usuarioId,
                respuesta_guardada: body,
                codigo_estado: res.statusCode,
              },
            })
            .catch((err) => console.error("Idempotency save error:", err));

          return originalJson(body);
        };

        next();
      })
      .catch(next);
  };
}

module.exports = idempotency;