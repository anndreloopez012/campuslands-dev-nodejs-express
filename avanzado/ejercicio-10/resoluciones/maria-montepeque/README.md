# Avanzado 10 - lectura de CSV

API de un circuito de ping pong hecha con Node.js y Express que **lee
archivos CSV** de partidos: calcula un ranking desde un archivo y revisa
CSV que suben los usuarios, diciendo fila por fila que esta mal.

## Por que no `texto.split("\n").map(l => l.split(","))`

Porque un CSV real tiene cosas como estas:

```csv
Fecha,Torneo,Jugador A,Jugador B,Sets A,Sets B
2026-03-01,"Copa Centroamericana, Guatemala",Ma Long,Fan Zhendong,3,1
2026-04-10,"Open ""Los Volcanes""",Hugo Calderano,Ma Long,3,2
```

- Un campo entre comillas puede tener **comas** (`"Copa ..., Guatemala"`).
- Una comilla dentro del campo se escribe **doble** (`""Los Volcanes""`).
- Un campo entre comillas puede tener **saltos de linea**.
- Excel en Windows guarda con `\r\n` y a veces con **BOM** al inicio.
- Excel en espanol usa **`;`** como separador (porque la coma es el
  decimal: `1,5`).

## El parser (`src/csv/parser.js`)

Es una **maquina de estados** que lee caracter por caracter (siguiendo el
RFC 4180) dentro de un `Transform` stream:

- Estados: dentro o fuera de comillas, y "acabo de ver una comilla
  dentro de comillas" (que puede ser el cierre o la primera de un `""`).
- El estado se guarda **entre chunks**: un chunk puede cortar a la mitad
  de un campo o justo entre las dos comillas de `""`. Hay un test que
  parte el texto de a **un caracter** por chunk.
- Detecta el separador (`,` o `;`) mirando la primera linea.
- Quita el BOM, trata `\r\n` como un solo salto y salta filas vacias.
- Cada fila guarda la **linea donde empieza** (si un campo tiene saltos
  de linea, la siguiente fila empieza mas abajo).
- Si quedan comillas sin cerrar, da error con la linea.

Despues `aObjetos()` usa la primera fila como encabezado y
**normaliza** los nombres: `" Jugador A "` -> `jugador_a`, `"Fécha"` ->
`fecha`. Asi no importa si el archivo viene con mayusculas o tildes.

## Validacion de cada fila (`src/servicios/partidos.js`)

- Cantidad de columnas correcta.
- `fecha` en formato `AAAA-MM-DD`.
- `torneo` y los dos jugadores, y que no sean el mismo.
- `sets_a` y `sets_b` enteros, con un marcador valido al mejor de 5 (el
  ganador tiene 3 y el otro 0, 1 o 2).

Las filas malas no paran la lectura: se juntan con su linea y sus
errores (maximo 50, para no devolver miles).

La misma funcion `leerPartidos(stream)` sirve para un archivo
(`fs.createReadStream`) y para el body de la peticion (`req`), porque los
dos son streams.

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                          |
| ------------- | ------------------------------------ |
| `npm start`   | Servidor en http://localhost:4010    |
| `npm run dev` | Servidor con recarga automatica      |
| `npm test`    | Tests del parser y de la API         |

## Endpoints

| Metodo | Ruta                       | Descripcion                                        |
| ------ | -------------------------- | -------------------------------------------------- |
| GET    | `/health`                  | El servidor vive                                   |
| GET    | `/api/ranking`             | Ranking leido de `data/partidos.csv`               |
| GET    | `/api/partidos`            | Partidos del archivo, `?jugador=`                  |
| POST   | `/api/partidos/revisar`    | Sube un CSV (`Content-Type: text/csv`) y dice que filas estan bien, sin guardar nada |
| GET    | `/api/formato`             | Columnas esperadas y un ejemplo                    |

## Ejemplos (PowerShell)

```bash
curl.exe http://localhost:4010/api/ranking
```

```json
{
  "ok": true,
  "partidosLeidos": 8,
  "filasConError": 0,
  "data": [
    { "jugador": "Truls Moregard", "jugados": 4, "ganados": 2, "perdidos": 2, "setsFavor": 10, "setsContra": 7, "diferenciaSets": 3 },
    { "jugador": "Ma Long", "jugados": 4, "ganados": 2, "perdidos": 2, "setsFavor": 9, "setsContra": 7, "diferenciaSets": 2 },
    "..."
  ]
}
```

Revisar un archivo propio:

```bash
curl.exe -X POST http://localhost:4010/api/partidos/revisar -H "Content-Type: text/csv" --data-binary "@mis-partidos.csv"
```

```json
{
  "ok": true,
  "data": {
    "filas": 6,
    "validos": 1,
    "invalidos": 5,
    "errores": [
      { "linea": 3, "errores": ["fecha \"01/05/2026\" no es AAAA-MM-DD"] },
      { "linea": 5, "errores": ["el marcador 3-3 no es valido al mejor de 5"] },
      { "linea": 7, "errores": ["tiene 3 columnas y deberia tener 6", "faltan jugadores", "sets_a y sets_b deben ser numeros enteros"] }
    ],
    "erroresTruncados": false,
    "vistaPrevia": [{ "fecha": "2026-05-01", "torneo": "Liga", "jugadorA": "Ana", "jugadorB": "Bea", "setsA": 3, "setsB": 1, "ganador": "Ana" }]
  }
}
```

Importante: usar `--data-binary` y no `-d`, porque `-d` le quita los
saltos de linea al archivo.

## Tests

- `test/parser.test.js`: campos simples, comas/comillas/saltos dentro de
  comillas, texto partido de a 1 caracter, `\r\n`, BOM, `;`, numero de
  linea, campos vacios, comillas sin cerrar, encabezados normalizados.
- `test/api.test.js`: ranking calculado a mano, torneos con coma y
  comillas, archivo que no existe, CSV con `;` y tildes, errores con
  linea, maximo 50 errores, columnas faltantes, 415.

```text
ℹ tests 18
ℹ pass 18
ℹ fail 0
```

Para comprobar que sirven hice que `""` no se convirtiera en una comilla
y fallaron 3 tests.

## Casos de error

| Caso                       | Status | Mensaje                                                 |
| -------------------------- | ------ | ------------------------------------------------------- |
| Faltan columnas            | 400    | `Al CSV le faltan columnas: ...` + `encabezadoLeido`    |
| Comillas sin cerrar        | 400    | `Comillas sin cerrar en la fila que empieza en la linea 2` |
| No es `text/csv`           | 415    | `Manda el archivo con Content-Type: text/csv`           |
| No esta `data/partidos.csv` | 500   | `No se encontro el archivo de partidos`                 |
| Fila invalida              | (200)  | Va en `errores` con su `linea`                          |
