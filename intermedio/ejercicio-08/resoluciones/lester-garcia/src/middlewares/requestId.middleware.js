import { randomUUID } from "node:crypto";

export const requestIdMiddleware = (req, res, next) => {
  // 1. Obtener el Request ID enviado por el cliente/gateway o generar uno nuevo
  const incomingRequestId = req.headers["x-request-id"];
  const requestId = (typeof incomingRequestId === "string" && incomingRequestId.trim() !== "")
    ? incomingRequestId.trim()
    : randomUUID();

  // 2. Adjuntar en el objeto req para consumo interno (logs, servicios, controladores)
  req.id = requestId;

  // 3. Establecer la cabecera de respuesta para trazabilidad del cliente
  res.setHeader("X-Request-Id", requestId);

  next();
};