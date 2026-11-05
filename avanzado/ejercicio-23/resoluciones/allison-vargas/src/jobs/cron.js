import { crear } from '../errores/index.js';

const CAMPOS = [
  { nombre: 'minuto', min: 0, max: 59 },
  { nombre: 'hora', min: 0, max: 23 },
  { nombre: 'dia', min: 1, max: 31 },
  { nombre: 'mes', min: 1, max: 12 },
  { nombre: 'diaSemana', min: 0, max: 7 },
];

export const ALIAS = Object.freeze({
  '@hourly': '0 * * * *',
  '@daily': '0 0 * * *',
  '@weekly': '0 0 * * 0',
  '@monthly': '0 0 1 * *',
});

const invalido = (expresion, motivo) => crear('CRON_INVALIDO', { expresion, motivo });

function leerCampo(texto, { nombre, min, max }, expresion) {
  const valores = new Set();
  for (const parte of texto.split(',')) {
    const [rango, pasoTexto] = parte.split('/');
    const paso = pasoTexto === undefined ? 1 : Number(pasoTexto);
    if (!Number.isInteger(paso) || paso < 1) throw invalido(expresion, `paso invalido en ${nombre}`);
    let desde;
    let hasta;
    if (rango === '*') {
      [desde, hasta] = [min, max];
    } else if (/^\d+-\d+$/.test(rango)) {
      [desde, hasta] = rango.split('-').map(Number);
    } else if (/^\d+$/.test(rango)) {
      desde = Number(rango);
      hasta = pasoTexto === undefined ? desde : max;
    } else {
      throw invalido(expresion, `valor no reconocido en ${nombre}: ${rango}`);
    }
    if (desde < min || hasta > max || desde > hasta) throw invalido(expresion, `${nombre} fuera de rango (${min}-${max})`);
    // el domingo se acepta como 0 o como 7
    for (let v = desde; v <= hasta; v += paso) valores.add(nombre === 'diaSemana' && v === 7 ? 0 : v);
  }
  return valores;
}

export function parsearCron(expresion) {
  if (typeof expresion !== 'string') throw invalido(String(expresion), 'debe ser texto');
  const normal = ALIAS[expresion.trim()] ?? expresion.trim();
  const partes = normal.split(/\s+/);
  if (partes.length !== 5) throw invalido(expresion, 'debe tener 5 campos: minuto hora dia mes diaSemana');
  const [minuto, hora, dia, mes, diaSemana] = partes.map((p, i) => leerCampo(p, CAMPOS[i], expresion));
  return {
    expresion: normal,
    minuto,
    hora,
    dia,
    mes,
    diaSemana,
    // como en cron clasico: si se restringen dia del mes y dia de semana, basta con que coincida uno
    diaLibre: partes[2] === '*',
    semanaLibre: partes[4] === '*',
  };
}

function coincideDia(cron, fecha) {
  const enMes = cron.dia.has(fecha.getUTCDate());
  const enSemana = cron.diaSemana.has(fecha.getUTCDay());
  if (cron.diaLibre && cron.semanaLibre) return true;
  if (cron.diaLibre) return enSemana;
  if (cron.semanaLibre) return enMes;
  return enMes || enSemana;
}

// proxima fecha (UTC, al minuto) estrictamente posterior a "desde"
export function siguiente(cron, desde) {
  const fecha = new Date(desde.getTime());
  fecha.setUTCSeconds(0, 0);
  fecha.setUTCMinutes(fecha.getUTCMinutes() + 1);
  const limite = desde.getTime() + 5 * 366 * 24 * 60 * 60 * 1000;
  while (fecha.getTime() <= limite) {
    if (!cron.mes.has(fecha.getUTCMonth() + 1)) {
      fecha.setUTCMonth(fecha.getUTCMonth() + 1, 1);
      fecha.setUTCHours(0, 0, 0, 0);
    } else if (!coincideDia(cron, fecha)) {
      fecha.setUTCDate(fecha.getUTCDate() + 1);
      fecha.setUTCHours(0, 0, 0, 0);
    } else if (!cron.hora.has(fecha.getUTCHours())) {
      fecha.setUTCHours(fecha.getUTCHours() + 1, 0, 0, 0);
    } else if (!cron.minuto.has(fecha.getUTCMinutes())) {
      fecha.setUTCMinutes(fecha.getUTCMinutes() + 1, 0, 0);
    } else {
      return fecha;
    }
  }
  throw invalido(cron.expresion, 'no ocurre nunca (por ejemplo 31 de febrero)');
}

export function proximas(expresion, desde, cantidad) {
  const cron = parsearCron(expresion);
  const fechas = [];
  let actual = desde;
  for (let i = 0; i < cantidad; i += 1) {
    actual = siguiente(cron, actual);
    fechas.push(actual.toISOString());
  }
  return fechas;
}
