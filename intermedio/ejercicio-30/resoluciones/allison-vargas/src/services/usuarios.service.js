import { publico } from './auth.service.js';

export function crearUsuariosService({ repositorio }) {
  const buscar = (id) => {
    const usuario = repositorio.buscar(id);
    return usuario ? publico(usuario) : null;
  };

  const mecanicos = () => repositorio
    .listar((u) => u.rol === 'mecanico' && u.activo)
    .map(({ id, nombre }) => ({ id, nombre }));

  const esMecanicoActivo = (id) => {
    const usuario = repositorio.buscar(id);
    return Boolean(usuario && usuario.rol === 'mecanico' && usuario.activo);
  };

  return { buscar, mecanicos, esMecanicoActivo };
}
