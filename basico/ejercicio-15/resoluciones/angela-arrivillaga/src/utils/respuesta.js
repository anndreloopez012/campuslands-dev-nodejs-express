export function enviarJson(res, status, datos) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(datos));
}
