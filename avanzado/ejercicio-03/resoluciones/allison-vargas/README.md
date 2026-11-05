# Avanzado 03 - validacion con schemas

API de un MOBA esports (heroes, equipos y drafts) cuya validacion se define con schemas declarativos. El proyecto incluye un pequeno motor de schemas propio, sin librerias externas, y lo usa en cada ruta.

Tematica: MOBA esports. Ruta base: `/avanzado/ejercicio-03`.

## Ejecutar

```bash
npm install
npm start
npm test
```

## Idea de diseno

- Un **schema** describe la forma de los datos una sola vez. Valida, limpia (recortar, minusculas, valores por defecto) y entrega datos ya confiables al servicio.
- Se valida en el borde: un middleware `validar({ parametros, consulta, cuerpo })` revisa las tres partes de la peticion y responde **todos** los errores juntos, indicando de donde viene cada uno (`en`) y la ruta exacta (`ruta`).
- Las reglas entre campos (tanque con armadura minima, un solo capitan, heroes no repetidos en el draft) viven en el schema, no en las rutas.
- Lo que depende de los datos guardados (que el equipo exista, que el jugador pertenezca a su equipo) se valida en el servicio y responde `422`.
- El mismo schema genera su **JSON Schema** para documentar la API (`GET /schemas/:nombre`).

## El motor de schemas (`src/schemas/`)

```js
const heroe = s.objeto({
  nombre: s.texto().recortar().min(2).max(24),
  dificultad: s.entero().min(1).max(5),
  etiquetas: s.arreglo(s.texto().minusculas()).max(5).unico().defecto([]),
}).refinar((h) => h.dificultad < 5 || h.etiquetas.length > 0, {
  codigo: 'sin_etiquetas',
  mensaje: 'los heroes muy dificiles necesitan etiquetas',
  ruta: 'etiquetas',
});

heroe.validar(entrada);
heroe.parsear(entrada);
```

| Pieza | Que ofrece |
| --- | --- |
| `s.texto()` | `recortar`, `minusculas`, `mayusculas`, `normalizarEspacios`, `min`, `max`, `largo`, `patron`, `email` |
| `s.numero()` / `s.entero()` | `min`, `max`, `coaccionar` (convierte texto numerico, para query strings) |
| `s.booleano()` | `coaccionar` |
| `s.enumerado([...])` / `s.literal(x)` | valores permitidos |
| `s.fecha()` / `s.fechaHora()` | AAAA-MM-DD reales; ISO 8601 en UTC normalizado |
| `s.arreglo(item)` | `min`, `max`, `largo`, `unico(selector, campo)` |
| `s.objeto({...})` | rechaza campos desconocidos; `parcial`, `pick`, `omit`, `extender`, `descartar`, `minimoUnCampo` |
| `s.unionPor('tipo', {...})` | elige el schema segun un campo discriminador |
| Modificadores | `opcional`, `nulo`, `defecto`, `transformar`, `verificar`, `refinar`, `describir` |

Cada error trae `ruta` (`habilidades[2].tecla`), `codigo` (`duplicado`) y `mensaje`. Los esquemas son inmutables: cada metodo devuelve uno nuevo. Las verificaciones entre campos solo se ejecutan cuando los campos individuales son validos.

Seguridad: un objeto rechaza `__proto__`, `constructor` y cualquier campo que no este en el schema.

## Rutas

| Ruta | Descripcion |
| --- | --- |
| `GET /` | Respuesta base del ejercicio |
| `GET /heroes` | Filtros `rol`, `dificultad`, `buscar`; `orden`, `pagina`, `limite` |
| `GET /heroes/:id` | Detalle |
| `POST /heroes` | Crear heroe |
| `PATCH /heroes/:id` | Cambios parciales (se valida el heroe completo resultante) |
| `GET /equipos`, `GET /equipos/:id` | Consulta; filtros `region`, `buscar` |
| `POST /equipos` | Crear equipo con cinco jugadores |
| `GET /drafts`, `GET /drafts/:id` | Consulta; filtro `equipoId` |
| `POST /drafts` | Crear draft con baneos y picks |
| `GET /schemas` | Schemas disponibles |
| `GET /schemas/:nombre` | JSON Schema |
| `POST /schemas/:nombre/validar` | Prueba un cuerpo sin guardarlo |

## Reglas destacadas

- Heroe: cuatro habilidades con teclas Q, W, E y R sin repetir; un tanque necesita armadura de 50 o mas; sin mana, ninguna habilidad puede costar mana; hasta cinco etiquetas unicas en minusculas.
- Equipo: cinco jugadores con roles y nicks distintos y exactamente un capitan; tag de 2 a 4 letras o numeros (se guarda en mayusculas).
- Draft: cada accion es `ban` o `pick` (union por `tipo`); un heroe se usa una sola vez; maximo 5 baneos y 5 picks por equipo; un jugador elige un solo heroe; los dos equipos deben ser distintos.
- Consultas: los parametros llegan como texto y el schema los convierte; los desconocidos, repetidos o mal formados se rechazan.

## Ejemplos

```bash
curl "http://localhost:3000/avanzado/ejercicio-03/heroes?rol=tanque&orden=dificultad_desc"
curl http://localhost:3000/avanzado/ejercicio-03/schemas/equipo
curl -X POST http://localhost:3000/avanzado/ejercicio-03/drafts \
  -H "Content-Type: application/json" \
  -d '{"azul":1,"rojo":2,"acciones":[{"tipo":"ban","equipo":"azul","heroe":4},{"tipo":"pick","equipo":"azul","heroe":1,"jugador":"Cazador"}]}'
curl -X PATCH http://localhost:3000/avanzado/ejercicio-03/heroes/1 \
  -H "Content-Type: application/json" -d '{"estadisticas":{"armadura":10}}'
```

Respuesta de error (varios problemas a la vez):

```json
{
  "ok": false,
  "message": "Datos invalidos",
  "codigo": "VALIDACION",
  "errores": [
    { "en": "cuerpo", "ruta": "nombre", "codigo": "muy_corto", "mensaje": "debe tener al menos 2 caracteres" },
    { "en": "cuerpo", "ruta": "habilidades[2].tecla", "codigo": "duplicado", "mensaje": "ya aparece en la posicion 0" },
    { "en": "cuerpo", "ruta": "extra", "codigo": "campo_desconocido", "mensaje": "campo no permitido" }
  ]
}
```

## Estructura

```text
src/
  app.js            rutas y manejo de errores
  schemas/          motor de schemas (texto, numeros, objeto, arreglo, union, fechas)
  validators/       schemas de heroes, equipos, drafts y consultas
  middlewares/      validar, errores, 404, 405, 415
  services/         reglas que dependen de los datos guardados
  routes/           heroes, equipos, drafts, schemas
  data/             datos de ejemplo
```

## Pruebas

`npm test` corre 151 pruebas con `node:test`: el motor (tipos, bordes, coaccion, rutas de error, derivacion de schemas, claves peligrosas, JSON Schema), los schemas del dominio (incluidos los datos de ejemplo) y la API completa (errores multiples, `PATCH` con revalidacion, referencias, 404, 405, 415, 413).
