export const apiVersionHeader = (version, options = {}) => {
  const { deprecated = false, sunsetDate, successorPath } = options;

  return (req, res, next) => {
    res.setHeader("X-API-Version", version);

    if (deprecated) {
      res.setHeader("Deprecation", "true");
      if (sunsetDate) {
        res.setHeader("Sunset", sunsetDate);
      }
      if (successorPath) {
        res.setHeader("Link", `<${successorPath}>; rel="successor-version"`);
      }
    }

    next();
  };
};
