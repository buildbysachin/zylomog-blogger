const ApiError = require("../utils/ApiError");

/**
 * Generic Zod-schema validation middleware.
 * Usage: router.post("/", validate(schemas.createPost), controller.createPost)
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map(
      (e) => `${e.path.join(".")}: ${e.message}`
    );
    return next(new ApiError(400, "Validation failed", errors));
  }
  req.body = result.data;
  next();
};

module.exports = validate;
