import { MemoryRepository } from '../repositories/memory.repository.js';
import { loadJson } from '../utils/loadJson.js';
import { crearTokens } from '../utils/tokens.js';
import { leerConfig } from '../config/index.js';
import { crearAuthService } from './auth.service.js';
import { crearUsuariosService } from './usuarios.service.js';
import { crearClientesService } from './clientes.service.js';
import { crearMotosService } from './motos.service.js';
import { crearRepuestosService } from './repuestos.service.js';
import { crearOrdenesService } from './ordenes.service.js';
import { crearReportesService } from './reportes.service.js';

export function crearServicios({ config = leerConfig(), reloj = () => new Date(), datos = {} } = {}) {
  const repo = (nombre) => new MemoryRepository(datos[nombre] ?? loadJson(`${nombre}.json`));
  const repoUsuarios = repo('usuarios');

  const tokens = crearTokens({ secreto: config.secretoToken, duracionSeg: config.duracionTokenSeg, reloj });
  const auth = crearAuthService({ repositorio: repoUsuarios, tokens });
  const usuarios = crearUsuariosService({ repositorio: repoUsuarios });
  const clientes = crearClientesService({ repositorio: repo('clientes') });
  const motos = crearMotosService({ repositorio: repo('motos'), clientes });
  const repuestos = crearRepuestosService({ repositorio: repo('repuestos') });
  const ordenes = crearOrdenesService({
    repositorio: repo('ordenes'),
    motos,
    clientes,
    repuestos,
    usuarios,
    reloj,
  });
  const reportes = crearReportesService({ ordenes, repuestos });

  return { auth, usuarios, clientes, motos, repuestos, ordenes, reportes };
}
