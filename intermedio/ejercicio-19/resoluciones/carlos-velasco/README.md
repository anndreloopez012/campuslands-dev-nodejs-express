# INTERMEDIO 19 - dotenv y configuracion

## Objetivo

Crear una API Node.js con Express donde toda la configuracion del proceso venga de variables de entorno, cargadas con `dotenv`, pacientes validadas una sola vez al arrancar en un modulo de config unico.

## Concepto principal

Reglas de la configuracion profesional:

1. **El .env no se sube**: se comitea `.gitignore` con `.env` y un `.env.example` de referencia para que otra persona sepa que variables hacen falta.
2. **Todo se valida al arrancar**: `app.config.js` lee/parsea/valida todas las variables una vez; si falta `PORT` o viene mal formada, la app muere en el arranque con error claro, no en la primera peticion.
3. **Tipos declarados**: `env.js` expone lectores (`string`, `entero`, `decimal`, `lista`, `booleano`) con default y rango.
4. **En produccion no se lee .env**: `NODE_ENV=production` asume variables inyectadas por el sistema (Docker, PM2, K8s).

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json          (dependencia dotenv)
├── .env.example          (referencia de variables, valores de demostracion)
├── .gitignore            (.env y node_modules)
├── README.md
└── src/
    ├── server.js         (levanta la app con la config leida)
    ├── app.js            (expres app exportable: testeable sin escuchar puertos)
    ├── config/
    │   ├── env.js        (lectores tipados de variables)
    │   └── app.config.js (objeto de config unico y validado)
    ├── routes/
    │   └── studio.routes.js
    ├── controllers/
    │   └── studio.controller.js
    ├── errors/
    │   └── app.error.js
    └── services/
        └── studio.service.js
```

## Como ejecutar

```bash
npm install
cp .env.example .env   # luego editar a gusto
npm run start
PORT=3100 npm start    # override rapido sin tocar el .env
```

## Variables soportadas

| Variable             | Tipo    | Default          | Uso                                  |
| -------------------- | ------- | ---------------- | ------------------------------------ |
| PORT                 | entero  | 3000 (1-65535)   | puerto del servidor                  |
| NODE_ENV             | string  | development      | controla si se lee el .env           |
| STUDIO_NAME          | string  | Estudio Tatuajes | nombre en /info                      |
| APP_TITLE            | string  | Tatuajes API     | banner de arranque                   |
| SERVICIOS            | lista   | tinta,retouch... | catalogo habilitado (valida POST)    |
| STUDIO_MODO_CALMADO  | booleano| true             | flag de negocio visible en /info     |

## Ejemplos de peticiones

```bash
# Info del estudio: la config ya validada y disponible
curl http://localhost:3000/info

# Servicios del catalogo viene del .env (SERVICIOS=tinta,retouch,diseno)
curl http://localhost:3000/servicios

# Reservar un turno con un servicio habilitado -> 201
curl -X POST http://localhost:3000/turnos \
  -H "Content-Type: application/json" \
  -d '{"cliente": "Lu Mesas", "servicio": "tinta", "horas": 2.5}'

# Caso de error: servicio fuera del .env -> 400 (config negocio, no de entrada)
curl -X POST http://localhost:3000/turnos \
  -H "Content-Type: application/json" \
  -d '{"cliente": "Otro", "servicio": "piercing", "horas": 1}'

# Puerto desde el entorno
PORT=3100 npm start
curl http://localhost:3100/health
```

## Punto clave

El "fail fast" es la gran leccion: configuracion invalida = el proceso no arranca. Esos 500 en una peticion a mitad del dia son mucho peor.
