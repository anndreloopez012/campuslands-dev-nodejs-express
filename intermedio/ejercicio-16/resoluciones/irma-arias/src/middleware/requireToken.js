export function requireToken(request, response, next) {
  const authorization = request.headers.authorization;
  if (authorization !== 'Bearer tienda-demo') return response.status(401).json({ error: 'Se requiere un token válido.' });
  next();
}
