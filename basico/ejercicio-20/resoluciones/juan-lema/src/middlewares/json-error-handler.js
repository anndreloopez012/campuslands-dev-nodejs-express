function jsonErrorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
    res.status(400).json({ ok: false, message: "JSON malformado en el body" });
    return;
  }
  next(err);
}

export { jsonErrorHandler };
