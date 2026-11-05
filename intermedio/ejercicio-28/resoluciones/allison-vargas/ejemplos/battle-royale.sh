#!/usr/bin/env bash
base="${1:-http://localhost:3000/intermedio/ejercicio-28}"
aleatorio=$((RANDOM % 9000 + 1000))
echo "Battle royale API - coleccion de ejemplos HTTP"

fallos=0

campo() {
  echo "$respuesta_cuerpo" | grep -oE "\"$1\":(\"[^\"]*\"|[0-9]+)" | head -1 | sed -E 's/^"[^"]*"://; s/"//g'
}

paso() {
  titulo="$1"; metodo="$2"; ruta="$3"; esperado="$4"; cuerpo="$5"; tipo="$6"
  echo ""
  echo "== $titulo"
  if [ -n "$cuerpo" ]; then
    salida=$(curl -s -w '\n%{http_code}' -X "$metodo" -H "Content-Type: $tipo" --data "$cuerpo" "$base$ruta")
  else
    salida=$(curl -s -w '\n%{http_code}' -X "$metodo" "$base$ruta")
  fi
  estado=$(echo "$salida" | tail -n 1)
  respuesta_cuerpo=$(echo "$salida" | sed '$d')
  if [ "$estado" = "$esperado" ]; then marca="OK"; else marca="FALLO"; fallos=$((fallos + 1)); fi
  echo "$metodo $ruta -> $estado (esperado $esperado) $marca"
  echo "$respuesta_cuerpo"
}

paso "Endpoint principal" GET "/" 200

paso "Listar jugadores de latam ordenados por kills" GET "/jugadores?region=latam&orden=kills&limite=3" 200

paso "Crear el jugador A" POST "/jugadores" 201 '{ "nick": "Ana_'"$aleatorio"'", "region": "latam" }' "application/json"
jugadorA=$(campo id)
nickA=$(campo nick)

paso "Crear el jugador B" POST "/jugadores" 201 '{ "nick": "Beto_'"$aleatorio"'", "region": "latam" }' "application/json"
jugadorB=$(campo id)

paso "Crear el jugador C" POST "/jugadores" 201 '{ "nick": "Caro_'"$aleatorio"'", "region": "eu" }' "application/json"
jugadorC=$(campo id)

paso "Ver el detalle del jugador A" GET "/jugadores/$jugadorA" 200

paso "Buscar jugadores por nick" GET "/jugadores?buscar=ana&limite=5" 200

paso "Crear una partida en la isla con 3 cupos" POST "/partidas" 201 '{ "mapa": "isla", "cupos": 3 }' "application/json"
partidaId=$(campo id)

paso "Unir al jugador A" POST "/partidas/$partidaId/jugadores" 201 '{ "jugadorId": '"$jugadorA"' }' "application/json"

paso "Unir al jugador B" POST "/partidas/$partidaId/jugadores" 201 '{ "jugadorId": '"$jugadorB"' }' "application/json"

paso "Unir al jugador C" POST "/partidas/$partidaId/jugadores" 201 '{ "jugadorId": '"$jugadorC"' }' "application/json"

paso "Retirar al jugador C antes de empezar" DELETE "/partidas/$partidaId/jugadores/$jugadorC" 200

paso "Volver a unir al jugador C" POST "/partidas/$partidaId/jugadores" 201 '{ "jugadorId": '"$jugadorC"' }' "application/json"

paso "Ver la partida con sus participantes" GET "/partidas/$partidaId" 200

paso "Iniciar la partida" POST "/partidas/$partidaId/iniciar" 200

paso "A elimina a C" POST "/partidas/$partidaId/eliminaciones" 200 '{ "eliminadoId": '"$jugadorC"', "eliminadorId": '"$jugadorA"' }' "application/json"

paso "A elimina a B y gana la partida" POST "/partidas/$partidaId/eliminaciones" 200 '{ "eliminadoId": '"$jugadorB"', "eliminadorId": '"$jugadorA"' }' "application/json"

paso "Ver los resultados de la partida" GET "/partidas/$partidaId/resultados" 200

paso "Listar partidas finalizadas" GET "/partidas?estado=finalizada&limite=5" 200

paso "Crear jugador con datos invalidos (400)" POST "/jugadores" 400 '{ "nick": "x!", "region": "marte" }' "application/json"

paso "Consultar una partida con id invalido (400)" GET "/partidas/abc" 400

paso "Consultar un jugador que no existe (404)" GET "/jugadores/999999" 404

paso "Crear un jugador con un nick repetido (409)" POST "/jugadores" 409 '{ "nick": "'"$nickA"'", "region": "na" }' "application/json"

paso "Iniciar una partida que ya termino (409)" POST "/partidas/$partidaId/iniciar" 409

paso "Usar un metodo no permitido (405)" PUT "/jugadores" 405

paso "Enviar un body que no es JSON (415)" POST "/jugadores" 415 'nick=Ana' "text/plain"

echo ""
if [ "$fallos" -eq 0 ]; then echo "Todos los ejemplos respondieron como se esperaba"; else echo "$fallos ejemplos fallaron"; exit 1; fi
