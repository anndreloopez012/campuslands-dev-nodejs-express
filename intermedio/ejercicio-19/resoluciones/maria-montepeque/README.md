# Ejercicio 19 - dotenv y config

API de un estudio de tatuajes hecha con Node.js y Express. Todo lo que
puede cambiar entre una compu y otra (puerto, IVA, moneda, si se aceptan
citas, la clave de admin) sale del archivo `.env` y pasa por un solo
modulo de configuracion.

## Como funciona

Todo esta en `src/config/env.js`:

1. `import "dotenv/config"` carga el `.env` en `process.env`.
2. `process.env` siempre trae texto, entonces hay funciones para
   convertirlo: `leerTexto`, `leerNumero`, `leerBooleano` y `leerOpcion`.
3. Si un valor no viene se usa uno por defecto. Si viene mal (por ejemplo
   `IVA_PORCENTAJE=200` o `PERMITIR_CITAS=talvez`) se guarda el error.
4. Al final, si hay errores, se muestran todos juntos y el servidor **no
   arranca** (`process.exit(1)`). Es mejor que falle al inicio a que falle
   con un cliente.
5. En `production` la `ADMIN_API_KEY` es obligatoria y no hay clave por
   defecto.
6. El objeto `config` se congela con `Object.freeze` y el resto del codigo
   lo importa. Ningun otro archivo lee `process.env` directo.

Que cambia segun la config:

- El precio final de cada diseno usa `IVA_PORCENTAJE` y `MONEDA`.
- `PERMITIR_CITAS=false` hace que crear citas responda 503.
- `MAX_CITAS_POR_DIA` limita las citas por fecha.
- Crear disenos pide el header `x-api-key` igual a `ADMIN_API_KEY`.
- En `production` los errores 500 no muestran el detalle.
- `GET /api/config` muestra la config publica, la clave sale oculta.

| Carpeta / archivo | Que hay dentro                                   |
| ----------------- | ------------------------------------------------ |
| `config/env.js`   | Carga, convierte y valida las variables          |
| `middlewares/`    | `api-key.middleware.js` para el header x-api-key |
| `routes/`         | `index.js`                                       |
| `controllers/`    | `estudio.controller.js`                          |
| `services/`       | Disenos (precio con IVA) y citas (reglas del .env) |
| `utils/`          | `app-error.js`                                   |
| `data/`           | `db.js` con disenos y citas en memoria           |

## Variables de entorno

```bash
copy .env.example .env
```

| Variable            | Tipo           | Por defecto            | Regla                         |
| ------------------- | -------------- | ---------------------- | ----------------------------- |
| `NODE_ENV`          | opcion         | `development`          | `development`, `production` o `test` |
| `PORT`              | numero         | `3019`                 | 1 a 65535                     |
| `ESTUDIO_NOMBRE`    | texto          | `Estudio de Tatuajes`  |                               |
| `MONEDA`            | opcion         | `GTQ`                  | `GTQ`, `USD` o `MXN`          |
| `IVA_PORCENTAJE`    | numero         | `12`                   | 0 a 50                        |
| `PERMITIR_CITAS`    | true / false   | `true`                 | tambien acepta 1 / 0          |
| `MAX_CITAS_POR_DIA` | numero         | `3`                    | 1 a 20                        |
| `ADMIN_API_KEY`     | texto          | `clave-de-desarrollo` (solo fuera de production) | En production obligatoria, 16 caracteres o mas |

- El `.env` no se sube al repo (esta en `.gitignore`), solo el
  `.env.example`.
- dotenv no pisa variables que ya existen, asi que se puede probar algo
  rapido sin tocar el `.env`:

```powershell
$env:PERMITIR_CITAS="false"; npm start
```

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                                        |
| ------------- | -------------------------------------------------- |
| `npm start`   | Levanta el servidor en http://localhost:3019       |
| `npm run dev` | Igual pero con recarga automatica (`node --watch`) |

## Endpoints

| Metodo | Ruta           | Descripcion                                    |
| ------ | -------------- | ---------------------------------------------- |
| GET    | `/health`      | Comprueba que el servidor vive                 |
| GET    | `/api/config`  | Config publica (la api key sale oculta)        |
| GET    | `/api/disenos` | Disenos con precio final segun IVA y moneda    |
| POST   | `/api/disenos` | Crea un diseno, pide header `x-api-key`        |
| GET    | `/api/citas`   | Lista las citas                                |
| POST   | `/api/citas`   | Crea una cita (si estan permitidas y hay espacio) |

Bodies:

- Diseno: `nombre`, `estilo`, `precioBase` (sin IVA).
- Cita: `disenoId`, `cliente`, `fecha` con formato `YYYY-MM-DD`.

## Ejemplos (PowerShell)

Ver la config:

```bash
curl.exe http://localhost:3019/api/config
```

```json
{
  "ok": true,
  "data": {
    "entorno": "development",
    "estudio": { "nombre": "Tinta Negra Studio", "moneda": "GTQ", "ivaPorcentaje": 12 },
    "citas": { "permitidas": true, "maxPorDia": 3 },
    "adminApiKey": "configurada (oculta)"
  }
}
```

Disenos con IVA del 12%:

```bash
curl.exe http://localhost:3019/api/disenos
```

```json
{ "id": 1, "nombre": "Rosa tradicional", "estilo": "old school", "precioBase": 500, "iva": "12%", "precioFinal": 560, "moneda": "GTQ" }
```

Crear un diseno con la clave del `.env`:

```bash
curl.exe -X POST http://localhost:3019/api/disenos -H "Content-Type: application/json" -H "x-api-key: cambia-esta-clave-larga" -d '{\"nombre\":\"Luna\",\"estilo\":\"fineline\",\"precioBase\":300}'
```

Crear una cita:

```bash
curl.exe -X POST http://localhost:3019/api/citas -H "Content-Type: application/json" -d '{\"disenoId\":1,\"cliente\":\"Mateo\",\"fecha\":\"2026-11-20\"}'
```

## Casos de error

| Caso                                    | Status | Mensaje                                            |
| --------------------------------------- | ------ | -------------------------------------------------- |
| Crear diseno sin header                 | 401    | `Falta el header x-api-key`                        |
| Crear diseno con clave mala             | 403    | `La x-api-key no es correcta`                      |
| Cita con `PERMITIR_CITAS=false`         | 503    | `Por ahora no estamos recibiendo citas`            |
| Cita en un dia lleno                    | 409    | `Ya no hay espacio el 2026-11-20, el maximo es 3 citas por dia` |
| Cita con fecha mal escrita              | 400    | `Datos invalidos` + lista `errors`                 |

Config mala al arrancar (el servidor se detiene):

```text
Error en la configuracion (.env):
 - PORT debe ser un numero entre 1 y 65535, llego "abc"
 - MONEDA debe ser uno de: GTQ, USD, MXN, llego "EUR"
 - IVA_PORCENTAJE debe ser un numero entre 0 y 50, llego "200"
 - PERMITIR_CITAS debe ser true o false, llego "talvez"
```

Production sin clave:

```text
Error en la configuracion (.env):
 - ADMIN_API_KEY es obligatoria en production y debe tener 16 caracteres o mas
```

## Notas

Los datos viven en memoria. Si se cambia el `.env` hay que reiniciar el
servidor para que tome los valores nuevos (con `npm run dev` no basta,
porque `--watch` solo mira los archivos `.js`).
