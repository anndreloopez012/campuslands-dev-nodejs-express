export function usuarioPublico(usuario) {
  const { passwordHash, ...publico } = usuario;
  return publico;
}
