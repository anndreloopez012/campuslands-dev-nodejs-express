export const requestLogger = (req, res, next) => {
  const startTimestamp = Date.now();

  // Escuchar el evento 'finish' de la respuesta para obtener el statusCode definitivo
  res.on("finish", () => {
    const duration = Date.now() - startTimestamp;
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const status = res.statusCode;

    console.log(`[${timestamp}] ${method} ${url} -> Status: ${status} (${duration}ms)`);
  });

  next();
};