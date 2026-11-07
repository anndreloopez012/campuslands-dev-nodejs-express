/**
 * Matriz de permisos del dominio turismo.
 * La permission no se pregunta por rol en el codigo: se pregunta por ACCION.
 */
const permisos = {
  turista: [
    'paquetes:listar',
    'paquetes:consultar',
    'reservas:crear-propia',
    'reservas:ver-propia',
    'reservas:cancelar-propia'
  ],
  agente: [
    'paquetes:listar',
    'paquetes:consultar',
    'paquetes:crear',
    'paquetes:editar',
    'reservas:crear-propia',
    'reservas:ver-propia',
    'reservas:ver-todas',
    'reservas:cancelar-propia',
    'reservas:cancelar-cualquiera'
  ],
  admin: ['*'] // comodin: todos los permisos, ahora y en el futuro
};

/**
 * ¿El rol puede ejecutar la accion?
 * Escalado de compatibilidad: "reservas:ver-todas" tambien cubre "reservas:ver-propia".
 */
function puede(rol, accion) {
  const lista = permisos[rol];
  if (!lista) return false;

  if (lista.includes('*')) return true;
  if (lista.includes(accion)) return true;

  // acciones equivalentes: ver-todas implica ver-propia y cancelar-cualquiera implica cancelar-propia
  const equivalencias = {
    'reservas:ver-propia': 'reservas:ver-todas',
    'reservas:cancelar-propia': 'reservas:cancelar-cualquiera'
  };
  const equivalente = equivalencias[accion];
  return equivalente ? lista.includes(equivalente) : false;
}

module.exports = { permisos, puede };
