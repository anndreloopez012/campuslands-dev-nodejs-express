import {
  esObjetoPlano, exigirCuerpo, leerEntero, leerTexto, rechazarSobrantes, terminar,
} from './comunes.js';

export function validarResena(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['autor', 'texto', 'estrellas'], errores);
  return terminar(errores, {
    autor: leerTexto(cuerpo, 'autor', errores, { min: 2, max: 40 }),
    texto: leerTexto(cuerpo, 'texto', errores, { min: 3, max: 400 }),
    estrellas: leerEntero(cuerpo, 'estrellas', errores, { min: 1, max: 5 }),
  });
}

export function validarPedido(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['puestoId', 'items'], errores);
  const puestoId = leerEntero(cuerpo, 'puestoId', errores, { min: 1 });
  const items = [];
  if (!Array.isArray(cuerpo.items) || cuerpo.items.length === 0 || cuerpo.items.length > 20) {
    errores.push({ campo: 'items', mensaje: 'debe ser una lista de 1 a 20 platos' });
  } else {
    cuerpo.items.forEach((item, i) => {
      const prefijo = `items[${i}]`;
      if (!esObjetoPlano(item)) {
        errores.push({ campo: prefijo, mensaje: 'debe ser un objeto' });
        return;
      }
      rechazarSobrantes(item, ['platoId', 'cantidad'], errores, prefijo);
      items.push({
        platoId: leerEntero(item, 'platoId', errores, { min: 1, prefijo }),
        cantidad: leerEntero(item, 'cantidad', errores, { min: 1, max: 10, prefijo }),
      });
    });
  }
  return terminar(errores, { puestoId, items });
}

export function validarAnalisis(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['cabeceras', 'https'], errores);
  if (!esObjetoPlano(cuerpo.cabeceras)) {
    errores.push({ campo: 'cabeceras', mensaje: 'debe ser un objeto { nombre: valor }' });
  } else {
    for (const [nombre, valor] of Object.entries(cuerpo.cabeceras)) {
      if (!/^[A-Za-z0-9-]{1,60}$/.test(nombre)) errores.push({ campo: `cabeceras.${nombre}`, mensaje: 'nombre invalido' });
      else if (typeof valor !== 'string' || valor.length > 2000) errores.push({ campo: `cabeceras.${nombre}`, mensaje: 'debe ser texto' });
    }
  }
  if (cuerpo.https !== undefined && typeof cuerpo.https !== 'boolean') errores.push({ campo: 'https', mensaje: 'debe ser booleano' });
  return terminar(errores, { cabeceras: cuerpo.cabeceras, https: cuerpo.https ?? false });
}

export function normalizarReporteCsp(cuerpo) {
  // formato antiguo: { "csp-report": {...} }; formato Reporting API: [{ type: "csp-violation", body: {...} }]
  const crudos = Array.isArray(cuerpo)
    ? cuerpo.filter((r) => r?.type === 'csp-violation').map((r) => r.body)
    : [cuerpo?.['csp-report']];
  const reportes = crudos.filter(esObjetoPlano).map((r) => ({
    directiva: String(r['violated-directive'] ?? r.effectiveDirective ?? r['effective-directive'] ?? 'desconocida').slice(0, 100),
    bloqueado: String(r['blocked-uri'] ?? r.blockedURL ?? '').slice(0, 300),
    documento: String(r['document-uri'] ?? r.documentURL ?? '').slice(0, 300),
  }));
  if (!reportes.length) terminar([{ campo: 'cuerpo', mensaje: 'no contiene reportes CSP' }]);
  return reportes;
}
