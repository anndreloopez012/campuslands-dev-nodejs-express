import { sustituir, tipoDe } from '../plantilla.js';

const resolver = (nombre) => `'"$${nombre}"'`;

const FUNCIONES = `fallos=0

campo() {
  echo "$respuesta_cuerpo" | grep -oE "\\"$1\\":(\\"[^\\"]*\\"|[0-9]+)" | head -1 | sed -E 's/^"[^"]*"://; s/"//g'
}

paso() {
  titulo="$1"; metodo="$2"; ruta="$3"; esperado="$4"; cuerpo="$5"; tipo="$6"
  echo ""
  echo "== $titulo"
  if [ -n "$cuerpo" ]; then
    salida=$(curl -s -w '\\n%{http_code}' -X "$metodo" -H "Content-Type: $tipo" --data "$cuerpo" "$base$ruta")
  else
    salida=$(curl -s -w '\\n%{http_code}' -X "$metodo" "$base$ruta")
  fi
  estado=$(echo "$salida" | tail -n 1)
  respuesta_cuerpo=$(echo "$salida" | sed '$d')
  if [ "$estado" = "$esperado" ]; then marca="OK"; else marca="FALLO"; fallos=$((fallos + 1)); fi
  echo "$metodo $ruta -> $estado (esperado $esperado) $marca"
  echo "$respuesta_cuerpo"
}`;

export function generarBash(pasos, { baseUrl, titulo }) {
  const lineas = [
    '#!/usr/bin/env bash',
    `base="\${1:-${baseUrl}}"`,
    `aleatorio=$((RANDOM % 9000 + 1000))`,
    `echo "${titulo}"`,
    '',
    FUNCIONES,
  ];

  for (const paso of pasos) {
    const ruta = sustituir(paso.ruta, (nombre) => `$${nombre}`);
    const tipo = tipoDe(paso);
    const argumentos = [`"${paso.titulo}"`, paso.metodo, `"${ruta}"`, String(paso.esperado)];
    if (paso.cuerpo !== undefined) {
      const compacto = paso.cuerpo.replace(/\s*\n\s*/g, ' ');
      argumentos.push(`'${sustituir(compacto, resolver)}'`, `"${tipo}"`);
    }
    lineas.push('', `paso ${argumentos.join(' ')}`);
    for (const [variable, nombre] of Object.entries(paso.guardar ?? {})) {
      lineas.push(`${variable}=$(campo ${nombre})`);
    }
  }

  lineas.push('', 'echo ""', 'if [ "$fallos" -eq 0 ]; then echo "Todos los ejemplos respondieron como se esperaba"; else echo "$fallos ejemplos fallaron"; exit 1; fi');
  return `${lineas.join('\n')}\n`;
}
