import { BASE_RUTAS } from '../constants/rutas.js';
import { componentes } from './componentes.js';
import { rutasSistema } from './paths.sistema.js';
import { rutasEquipos } from './paths.equipos.js';
import { rutasTorneos } from './paths.torneos.js';

export function construirOpenApi() {
  return {
    openapi: '3.0.3',
    info: {
      title: 'API de MOBA esports',
      version: '1.0.0',
      description: [
        'Equipos, torneos e inscripciones de una liga de MOBA.',
        'Todas las respuestas JSON usan el formato { ok, data } en caso de exito y { ok: false, message, codigo, errores? } en caso de error.',
        'Un metodo que no esta documentado para una ruta responde 405 con el header Allow. Una ruta inexistente responde 404 con codigo RUTA_NO_ENCONTRADA.',
        'Los requests con body deben enviar Content-Type: application/json y pesar menos de 10 KB.',
      ].join(' '),
    },
    servers: [{ url: BASE_RUTAS, description: 'Servidor local' }],
    tags: [
      { name: 'Sistema', description: 'Estado y documentacion de la API.' },
      { name: 'Equipos', description: 'Alta, consulta y baja de equipos.' },
      { name: 'Torneos', description: 'Consulta de torneos.' },
      { name: 'Inscripciones', description: 'Equipos inscritos en cada torneo.' },
    ],
    paths: { ...rutasSistema, ...rutasEquipos, ...rutasTorneos },
    components: componentes,
  };
}
