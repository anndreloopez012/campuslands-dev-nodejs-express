export function retardoDeReintento(intento, { backoffBaseMs, backoffMaxMs }) {
  const exponente = Math.max(0, intento - 1);
  return Math.min(backoffMaxMs, backoffBaseMs * 2 ** exponente);
}
