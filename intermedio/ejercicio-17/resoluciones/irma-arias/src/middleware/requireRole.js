export function requireRole(role) {
  return (request, response, next) => {
    if (request.headers['x-user-role'] !== role) return response.status(403).json({ error: 'No tiene permiso para esta operación.' });
    next();
  };
}
