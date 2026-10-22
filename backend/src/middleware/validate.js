// Guards routes that take a `:id` parameter against malformed identifiers.
// PostgreSQL UUID columns reject non-UUID input with a 22P02 error, which would
// otherwise surface as a 500. Validating up-front lets us return a clean 400
// instead of leaking a database error to the client.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const validateUuidParam = (paramName = 'id') => (req, res, next) => {
  const value = req.params[paramName];
  if (!UUID_RE.test(String(value || ''))) {
    return res.status(400).json({ message: `Invalid ${paramName} format` });
  }
  return next();
};

module.exports = { validateUuidParam, UUID_RE };