param([string]$base = "http://localhost:3000/intermedio/ejercicio-28")

Write-Host "Battle royale API - coleccion de ejemplos HTTP"
$aleatorio = Get-Random -Minimum 1000 -Maximum 9999
$fallos = 0

function Paso($titulo, $metodo, $ruta, $esperado, $cuerpo, $tipo) {
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
}

$null = Paso "Endpoint principal" "GET" "/" 200

$null = Paso "Listar jugadores de latam ordenados por kills" "GET" "/jugadores?region=latam&orden=kills&limite=3" 200

$cuerpo = @"
{
  "nick": "Ana_$aleatorio",
  "region": "latam"
}
"@
$r = Paso "Crear el jugador A" "POST" "/jugadores" 201 $cuerpo "application/json"
$jugadorA = $r.data.id
$nickA = $r.data.nick

$cuerpo = @"
{
  "nick": "Beto_$aleatorio",
  "region": "latam"
}
"@
$r = Paso "Crear el jugador B" "POST" "/jugadores" 201 $cuerpo "application/json"
$jugadorB = $r.data.id

$cuerpo = @"
{
  "nick": "Caro_$aleatorio",
  "region": "eu"
}
"@
$r = Paso "Crear el jugador C" "POST" "/jugadores" 201 $cuerpo "application/json"
$jugadorC = $r.data.id

$null = Paso "Ver el detalle del jugador A" "GET" "/jugadores/$jugadorA" 200

$null = Paso "Buscar jugadores por nick" "GET" "/jugadores?buscar=ana&limite=5" 200

$cuerpo = @"
{
  "mapa": "isla",
  "cupos": 3
}
"@
$r = Paso "Crear una partida en la isla con 3 cupos" "POST" "/partidas" 201 $cuerpo "application/json"
$partidaId = $r.data.id

$cuerpo = @"
{
  "jugadorId": $jugadorA
}
"@
$null = Paso "Unir al jugador A" "POST" "/partidas/$partidaId/jugadores" 201 $cuerpo "application/json"

$cuerpo = @"
{
  "jugadorId": $jugadorB
}
"@
$null = Paso "Unir al jugador B" "POST" "/partidas/$partidaId/jugadores" 201 $cuerpo "application/json"

$cuerpo = @"
{
  "jugadorId": $jugadorC
}
"@
$null = Paso "Unir al jugador C" "POST" "/partidas/$partidaId/jugadores" 201 $cuerpo "application/json"

$null = Paso "Retirar al jugador C antes de empezar" "DELETE" "/partidas/$partidaId/jugadores/$jugadorC" 200

$cuerpo = @"
{
  "jugadorId": $jugadorC
}
"@
$null = Paso "Volver a unir al jugador C" "POST" "/partidas/$partidaId/jugadores" 201 $cuerpo "application/json"

$null = Paso "Ver la partida con sus participantes" "GET" "/partidas/$partidaId" 200

$null = Paso "Iniciar la partida" "POST" "/partidas/$partidaId/iniciar" 200

$cuerpo = @"
{
  "eliminadoId": $jugadorC,
  "eliminadorId": $jugadorA
}
"@
$null = Paso "A elimina a C" "POST" "/partidas/$partidaId/eliminaciones" 200 $cuerpo "application/json"

$cuerpo = @"
{
  "eliminadoId": $jugadorB,
  "eliminadorId": $jugadorA
}
"@
$null = Paso "A elimina a B y gana la partida" "POST" "/partidas/$partidaId/eliminaciones" 200 $cuerpo "application/json"

$null = Paso "Ver los resultados de la partida" "GET" "/partidas/$partidaId/resultados" 200

$null = Paso "Listar partidas finalizadas" "GET" "/partidas?estado=finalizada&limite=5" 200

$cuerpo = @"
{
  "nick": "x!",
  "region": "marte"
}
"@
$null = Paso "Crear jugador con datos invalidos (400)" "POST" "/jugadores" 400 $cuerpo "application/json"

$null = Paso "Consultar una partida con id invalido (400)" "GET" "/partidas/abc" 400

$null = Paso "Consultar un jugador que no existe (404)" "GET" "/jugadores/999999" 404

$cuerpo = @"
{
  "nick": "$nickA",
  "region": "na"
}
"@
$null = Paso "Crear un jugador con un nick repetido (409)" "POST" "/jugadores" 409 $cuerpo "application/json"

$null = Paso "Iniciar una partida que ya termino (409)" "POST" "/partidas/$partidaId/iniciar" 409

$null = Paso "Usar un metodo no permitido (405)" "PUT" "/jugadores" 405

$cuerpo = @"
nick=Ana
"@
$null = Paso "Enviar un body que no es JSON (415)" "POST" "/jugadores" 415 $cuerpo "text/plain"

Write-Host ""
if ($fallos -eq 0) { Write-Host "Todos los ejemplos respondieron como se esperaba" } else { Write-Host "$fallos ejemplos fallaron"; exit 1 }
