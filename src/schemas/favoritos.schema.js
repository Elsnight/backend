const { z } = require("zod");

const marcarFavoritoSchema = z.object({
  comercio_id: z.string().uuid(),
});

module.exports = { marcarFavoritoSchema };