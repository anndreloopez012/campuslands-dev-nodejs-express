export function neutralizar(valor) {
  if (typeof valor !== 'string') return valor;
  return /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
}

export function escaparCelda(valor, delimitador = ',') {
  if (valor === null || valor === undefined) return '';
  const texto = String(neutralizar(valor));
  const necesita = texto.includes(delimitador) || /["\r\n]/.test(texto) || texto !== texto.trim();
  return necesita ? `"${texto.replaceAll('"', '""')}"` : texto;
}

export function escribirCsv(columnas, filas, { delimitador = ',' } = {}) {
  const lineas = [columnas.join(delimitador)];
  for (const fila of filas) lineas.push(columnas.map((c) => escaparCelda(fila[c], delimitador)).join(delimitador));
  return `${lineas.join('\r\n')}\r\n`;
}
