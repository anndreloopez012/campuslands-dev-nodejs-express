import { usuariosRepository } from '../repositories/usuarios.repository.js';
import { NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum, filtroBooleano } from '../validators/consulta.js';
import { usuarioPublico } from '../utils/usuarioPublico.js';
import { resumen } from '../utils/hash.js';

const ordenes = {
  id: (a, b) => a.id - b.id,
  nombre: (a, b) => a.nombre.localeCompare(b.nombre) || a.id - b.id,
};

const configListado = {
  filtros: {
    algoritmo: filtroEnum(['scrypt', 'sha256']),
    actualizado: filtroBooleano,
  },
  ordenes,
  ordenPorDefecto: 'id',
};

const conInfo = (usuario) => ({ ...usuarioPublico(usuario), hash: resumen(usuario.passwordHash) });

export function obtener(id) {
  const usuario = usuariosRepository.buscar(id);
  if (!usuario) throw new NotFoundError(`No existe el usuario ${id}`, 'USUARIO_NO_ENCONTRADO');
  return conInfo(usuario);
}

export function listar(query) {
  const consulta = leerListado(query, configListado);
  const { algoritmo, actualizado } = consulta.filtros;

  const filtrados = usuariosRepository
    .listar((usuario) => {
      const info = resumen(usuario.passwordHash);
      return (algoritmo === undefined || info.algoritmo === algoritmo)
        && (actualizado === undefined || info.actualizado === actualizado);
    })
    .sort(consulta.comparador)
    .map(conInfo);

  return paginar(filtrados, consulta.pagina, consulta.limite);
}
