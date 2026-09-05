const { errorEnvelope } = require("../utils/envelope");

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.flatten().fieldErrors;
      return res
        .status(400)
        .json(errorEnvelope("VALIDATION_ERROR", "Datos inválidos", details));
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validate };