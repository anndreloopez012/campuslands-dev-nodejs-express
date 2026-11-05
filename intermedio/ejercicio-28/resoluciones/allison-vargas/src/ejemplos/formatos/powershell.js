import { sustituir, tipoDe } from '../plantilla.js';

const resolver = (nombre) => `$${nombre}`;

const FUNCION = `function Paso($titulo, $metodo, $ruta, $esperado, $cuerpo, $tipo) {
  Write-Host ""
  Write-Host "== $titulo"
  $parametros = @{ Method = $metodo; Uri = "$base$ruta"; UseBasicParsing = $true }
  if ($cuerpo) {
    $parametros.Body = $cuerpo
    $parametros.ContentType = $tipo
  }
  $estado = 0
  $texto = ""
  try {
    $respuesta = Invoke-WebRequest @parametros
    $estado = [int]$respuesta.StatusCode
    $texto = $respuesta.Content
  } catch {
    if ($_.Exception.Response) { $estado = [int]$_.Exception.Response.StatusCode }
    $texto = $_.ErrorDetails.Message
  }
  $marca = if ($estado -eq $esperado) { "OK" } else { "FALLO" }
  if ($marca -eq "FALLO") { $script:fallos++ }
  Write-Host "$metodo $ruta -> $estado (esperado $esperado) $marca"
  Write-Host $texto
  if ($texto) { return ($texto | ConvertFrom-Json) }
}`;

export function generarPowershell(pasos, { baseUrl, titulo }) {
  const lineas = [
    `param([string]$base = "${baseUrl}")`,
    '',
    `Write-Host "${titulo}"`,
    `$aleatorio = Get-Random -Minimum 1000 -Maximum 9999`,
    '$fallos = 0',
    '',
    FUNCION,
  ];

  for (const paso of pasos) {
    const ruta = sustituir(paso.ruta, resolver);
    const tipo = tipoDe(paso);
    const argumentos = [`"${paso.titulo}"`, `"${paso.metodo}"`, `"${ruta}"`, String(paso.esperado)];
    lineas.push('');
    if (paso.cuerpo !== undefined) {
      lineas.push('$cuerpo = @"', sustituir(paso.cuerpo, resolver), '"@');
      argumentos.push('$cuerpo', `"${tipo}"`);
    }
    const llamada = `Paso ${argumentos.join(' ')}`;
    const guardar = Object.entries(paso.guardar ?? {});
    if (guardar.length) {
      lineas.push(`$r = ${llamada}`);
      for (const [variable, campo] of guardar) lineas.push(`$${variable} = $r.data.${campo}`);
    } else {
      lineas.push(`$null = ${llamada}`);
    }
  }

  lineas.push('', 'Write-Host ""', 'if ($fallos -eq 0) { Write-Host "Todos los ejemplos respondieron como se esperaba" } else { Write-Host "$fallos ejemplos fallaron"; exit 1 }');
  return `${lineas.join('\n')}\n`;
}
