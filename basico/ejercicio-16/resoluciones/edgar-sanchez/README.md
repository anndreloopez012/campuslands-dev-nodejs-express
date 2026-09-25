# BASICO 16 - primer servidor Express

**Desarrollador:** Edgar Sánchez

## Descripción de la solución

Esta entrega resuelve el ejercicio básico 16, cuyo objetivo es crear el primer servidor HTTP con Node.js y Express. La API representa un contexto de ropa y sneakers y expone información del ejercicio desde las rutas `GET /` y `GET /health`.

La solución conserva una estructura pequeña, pero organizada por capas. De esta forma se entiende cómo se prepara una aplicación Express sin mezclar complejidad innecesaria en un ejercicio introductorio.

## Cómo se pensó la solución

1. Se identificó que el ejercicio necesita un servidor Express que responda una solicitud `GET`.
2. Se definió `GET /` como endpoint principal y `GET /health` como comprobación rápida del estado del servicio.
3. Se separó cada responsabilidad:
   - `data` contiene la información fija del ejercicio.
   - `services` prepara los objetos que serán enviados al cliente.
   - `controllers` decide el código de estado y ejecuta la respuesta HTTP.
   - `routes` relaciona las URL con sus controladores.
   - `app` configura Express y sus middlewares.
   - `server` abre el puerto y administra el cierre del proceso.
4. Se agregó una respuesta JSON para rutas inexistentes con código `404`.
5. Se agregó manejo de errores para que un cuerpo JSON inválido produzca una respuesta clara con código `400`.
6. Se crearon pruebas automáticas con el módulo de pruebas nativo de Node.js, sin agregar dependencias innecesarias.

## Estructura del proyecto

```text
edgar-sanchez/
├── package.json
├── package-lock.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── controllers/
│   │   └── welcome.controller.js
│   ├── data/
│   │   └── exercise.data.js
│   ├── routes/
│   │   └── welcome.routes.js
│   └── services/
│       └── welcome.service.js
└── test/
    └── app.test.js
```

## Requisitos

- Node.js 20 o superior.
- npm.

## Instalación

Desde la raíz del repositorio, ejecuta:

```bash
cd basico/ejercicio-16/resoluciones/edgar-sanchez
npm install
```

El comando instala Express y genera el archivo `package-lock.json` si todavía no existe.

## Ejecución

### Modo de desarrollo

```bash
npm run dev
```

Express escuchará en `http://localhost:3000`. El script usa `node --watch`, por lo que reinicia el servidor cuando se modifica un archivo del proyecto. Para detenerlo, presiona `Ctrl + C`.

### Modo normal

```bash
npm start
```

Para iniciar el servidor en otro puerto:

```bash
PORT=4000 npm start
```

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/` | Devuelve la respuesta principal con los datos del ejercicio. |
| `GET` | `/health` | Confirma que el servicio está activo. |

## Pruebas manuales

Abre otra terminal, entra a la carpeta de la solución y ejecuta:

```bash
curl http://localhost:3000/
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "exercise": {
    "number": 16,
    "title": "BASICO 16 - primer servidor Express",
    "topic": "primer servidor Express",
    "theme": "ropa y sneakers"
  },
  "developer": "Edgar Sánchez"
}
```

Comprueba el estado del servicio:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "status": "up",
  "service": "basico-16-api"
}
```

Comprueba el manejo de una ruta inexistente:

```bash
curl -i http://localhost:3000/no-existe
```

El servidor responderá con estado `404` y un mensaje JSON descriptivo.

## Pruebas automáticas

Con las dependencias instaladas, pero sin iniciar `npm run dev`, ejecuta:

```bash
npm test
```

Las pruebas verifican la ruta principal, la ruta de estado, el error `404` y el error `400` para JSON inválido.

## Decisiones técnicas

- Se usa ECMAScript Modules con `"type": "module"`.
- Se usa Express 5 y Node.js 20 o superior.
- No se utiliza una base de datos porque el ejercicio solo presenta información estática.
- No se expone la cabecera `X-Powered-By` de Express.
- Todas las respuestas, incluidas las de error, tienen formato JSON.
- `app.js` se puede importar en las pruebas sin iniciar un puerto; `server.js` es el punto de entrada del proceso.