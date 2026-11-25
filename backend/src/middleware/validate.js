export const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorDetails = result.error.issues.map(
        (issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`
      );
      return res.status(400).json({
        success: false,
        message: 'Validation error: Input data does not satisfy emergency requirements.',
        errors: errorDetails
      });
    }
    req.body = result.data;
    next();
  };
};
