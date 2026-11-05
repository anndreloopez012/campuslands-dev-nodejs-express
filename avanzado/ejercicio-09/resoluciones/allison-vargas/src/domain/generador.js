import { CATEGORIAS } from '../constants/combates.js';

const FECHA_BASE = Date.UTC(2018, 0, 1);
const DIA_MS = 24 * 60 * 60 * 1000;

function mulberry32(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function agruparPorCategoria(peleadores) {
  return Object.fromEntries(CATEGORIAS.map((c) => [c, peleadores.filter((p) => p.categoria === c)]));
}

export function generarCombate(id, porCategoria) {
  const azar = mulberry32(Math.imul(id, 2654435761));
  const categoria = CATEGORIAS[Math.floor(azar() * CATEGORIAS.length)];
  const grupo = porCategoria[categoria];
  const i = Math.floor(azar() * grupo.length);
  let j = Math.floor(azar() * (grupo.length - 1));
  if (j >= i) j += 1;
  const rojo = grupo[i];
  const azul = grupo[j];
  const sorteo = azar();
  let metodo = 'empate';
  if (sorteo < 0.18) metodo = 'ko';
  else if (sorteo < 0.36) metodo = 'tko';
  else if (sorteo < 0.88) metodo = 'decision';
  else if (sorteo < 0.93) metodo = 'descalificacion';
  const gana = azar() < 0.5 ? rojo : azul;
  const porPuntos = metodo === 'decision' || metodo === 'empate';
  return {
    id,
    fecha: new Date(FECHA_BASE + Math.floor((id - 1) / 10) * DIA_MS).toISOString().slice(0, 10),
    categoria,
    rojoId: rojo.id,
    azulId: azul.id,
    ganadorId: metodo === 'empate' ? null : gana.id,
    metodo,
    rounds: porPuntos ? [3, 5][Math.floor(azar() * 2)] : 1 + Math.floor(azar() * 5),
    golpesRojo: 20 + Math.floor(azar() * 280),
    golpesAzul: 20 + Math.floor(azar() * 280),
  };
}
