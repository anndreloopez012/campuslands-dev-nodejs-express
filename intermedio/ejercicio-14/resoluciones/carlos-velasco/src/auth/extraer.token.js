function extraerToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [esquema, token] = header.split(' ');
  // Solo se acepta el esquema "Bearer <token>"
  return esquema === 'Bearer' && token ? token : null;
}

module.exports = { extraerToken };
