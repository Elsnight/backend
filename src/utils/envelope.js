function successEnvelope(data, meta = {}) {
  return { success: true, data, meta };
}

function errorEnvelope(code, message, details = null) {
  const error = { code, message };
  if (details) error.details = details;
  return { success: false, error };
}

module.exports = { successEnvelope, errorEnvelope };