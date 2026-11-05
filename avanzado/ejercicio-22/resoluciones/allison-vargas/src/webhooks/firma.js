import { createHmac, timingSafeEqual } from 'node:crypto';

export const TOLERANCIA_S = 300;

export const calcularFirma = (secreto, timestamp, cuerpo) => createHmac('sha256', secreto)
  .update(`${timestamp}.${cuerpo}`)
  .digest('hex');

// formato: "t=1730800000,v1=abcdef..." (se firma el timestamp junto con el body para impedir repeticiones viejas)
export function firmar(secreto, cuerpo, ahoraS) {
  return `t=${ahoraS},v1=${calcularFirma(secreto, ahoraS, cuerpo)}`;
}

export function verificarFirma(cabecera, cuerpo, secretos, { ahoraS, toleranciaS = TOLERANCIA_S }) {
  if (typeof cabecera !== 'string') return { valida: false, motivo: 'falta la firma' };
  const partes = Object.fromEntries(cabecera.split(',').map((p) => p.trim().split('=')));
  const timestamp = Number(partes.t);
  if (!Number.isInteger(timestamp) || !/^[0-9a-f]{64}$/.test(partes.v1 ?? '')) return { valida: false, motivo: 'formato invalido' };
  if (Math.abs(ahoraS - timestamp) > toleranciaS) return { valida: false, motivo: 'timestamp fuera de tolerancia' };
  const recibida = Buffer.from(partes.v1, 'hex');
  // se aceptan varios secretos para poder rotarlos sin cortar las entregas
  const coincide = secretos.some((secreto) => {
    const esperada = Buffer.from(calcularFirma(secreto, timestamp, cuerpo), 'hex');
    return timingSafeEqual(esperada, recibida);
  });
  return coincide ? { valida: true } : { valida: false, motivo: 'firma incorrecta' };
}
