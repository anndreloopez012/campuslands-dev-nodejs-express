import { normalizarClave } from './texto.js';

const redondear = (n) => Math.round(n * 100) / 100;

function lado(partido, clave) {
  if (normalizarClave(partido.local) === clave) {
    return {
      nombre: partido.local,
      gano: partido.ganador === 'local',
      setsAFavor: partido.setsLocal,
      setsEnContra: partido.setsVisita,
      puntosAFavor: partido.puntosLocal,
      puntosEnContra: partido.puntosVisita,
    };
  }
  return {
    nombre: partido.visita,
    gano: partido.ganador === 'visita',
    setsAFavor: partido.setsVisita,
    setsEnContra: partido.setsLocal,
    puntosAFavor: partido.puntosVisita,
    puntosEnContra: partido.puntosLocal,
  };
}

function acumular(acum, l) {
  acum.partidos += 1;
  if (l.gano) acum.victorias += 1;
  else acum.derrotas += 1;
  acum.setsGanados += l.setsAFavor;
  acum.setsPerdidos += l.setsEnContra;
  if (l.puntosAFavor !== null) {
    acum.puntosAFavor += l.puntosAFavor;
    acum.puntosEnContra += l.puntosEnContra;
    acum.partidosConPuntos += 1;
  }
}

const vacio = (nombre) => ({
  nombre, partidos: 0, victorias: 0, derrotas: 0, setsGanados: 0, setsPerdidos: 0, puntosAFavor: 0, puntosEnContra: 0, partidosConPuntos: 0,
});

function cerrar(acum) {
  const { partidosConPuntos, ...resto } = acum;
  return {
    ...resto,
    porcentajeVictorias: acum.partidos ? redondear((acum.victorias / acum.partidos) * 100) : 0,
    diferenciaDeSets: acum.setsGanados - acum.setsPerdidos,
    porcentajePuntos: acum.puntosAFavor + acum.puntosEnContra
      ? redondear((acum.puntosAFavor / (acum.puntosAFavor + acum.puntosEnContra)) * 100)
      : null,
  };
}

export function ranking(partidos, { torneo, minPartidos = 1, limite = 10 } = {}) {
  const filtro = torneo ? normalizarClave(torneo) : null;
  const porJugador = new Map();
  for (const partido of partidos) {
    if (filtro && normalizarClave(partido.torneo) !== filtro) continue;
    for (const nombre of [partido.local, partido.visita]) {
      const clave = normalizarClave(nombre);
      if (!porJugador.has(clave)) porJugador.set(clave, vacio(nombre));
      acumular(porJugador.get(clave), lado(partido, clave));
    }
  }
  return [...porJugador.values()]
    .filter((a) => a.partidos >= minPartidos)
    .map(cerrar)
    .sort((a, b) => b.victorias - a.victorias || b.diferenciaDeSets - a.diferenciaDeSets || a.nombre.localeCompare(b.nombre))
    .slice(0, limite)
    .map((fila, i) => ({ posicion: i + 1, ...fila }));
}

export function partidosDe(partidos, nombre) {
  const clave = normalizarClave(nombre);
  return partidos.filter((p) => normalizarClave(p.local) === clave || normalizarClave(p.visita) === clave);
}

export function resumenDe(partidos, nombre) {
  const clave = normalizarClave(nombre);
  const propios = partidosDe(partidos, nombre);
  if (propios.length === 0) return null;
  const acum = vacio(lado(propios[0], clave).nombre);
  for (const partido of propios) acumular(acum, lado(partido, clave));
  return cerrar(acum);
}

export function enfrentamientos(partidos, a, b) {
  const claveA = normalizarClave(a);
  const claveB = normalizarClave(b);
  const comunes = partidos.filter((p) => {
    const l = normalizarClave(p.local);
    const v = normalizarClave(p.visita);
    return (l === claveA && v === claveB) || (l === claveB && v === claveA);
  });
  const resultado = {
    partidos: comunes.length, victoriasA: 0, victoriasB: 0, setsA: 0, setsB: 0,
  };
  for (const partido of comunes) {
    const ladoA = lado(partido, claveA);
    if (ladoA.gano) resultado.victoriasA += 1;
    else resultado.victoriasB += 1;
    resultado.setsA += ladoA.setsAFavor;
    resultado.setsB += ladoA.setsEnContra;
  }
  return { resultado, comunes };
}
