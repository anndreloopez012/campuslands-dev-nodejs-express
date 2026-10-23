# Básico 01 — Node runtime y consola (RPG)

Proyecto de introducción a Node.js y Express, resuelto como parte de los
ejercicios de Campuslands. Ruta dentro del repositorio:
`basico/ejercicio-01/resoluciones/estiben-ixen/`.

---

## 1. Razonamiento (cómo entendí el problema)

El enunciado pedía algo puntual: no una aplicación grande, sino demostrar
que entiendo cómo funciona el **runtime de Node.js** junto con **Express**
para levantar un servidor HTTP simple. Antes de escribir código, identifiqué
tres cosas:

- **Qué se necesita recibir**: una petición `GET` a una ruta específica
  (`/basico/ejercicio-01`), sin datos de entrada complejos (no hay body,
  no hay parámetros).
- **Qué se necesita devolver**: un JSON fijo con la forma
  `{ ok, message, topic }`.
- **Cómo organizarlo**: el enunciado exige separar el proyecto en capas
  (`routes`, `controllers`, `services`), así que en vez de resolver todo
  en un solo archivo, dividí la responsabilidad: las rutas solo mapean
  URLs, el controlador decide la respuesta HTTP, y el servicio contiene
  el dato/lógica real.

Durante el proceso encontré errores reales que me ayudaron a entender
mejor el flujo: una ruta duplicada por no saber cómo se acumulan los
prefijos en `app.use()`, y una confusión entre la sintaxis de rutas de
archivo (`./`) y la sintaxis de rutas HTTP (`/`). Corregirlos a mano fue
donde realmente entendí cómo Express arma el mapa de rutas internamente.

## 2. Planteamiento de la solución

La solución es un servidor Express con dos rutas:

- `GET /health` — ruta de salud, confirma que el servidor está vivo.
- `GET /basico/ejercicio-01` — ruta pedida por el ejercicio, responde el
  JSON esperado.

El proyecto está dividido en tres capas, cada una con una única
responsabilidad:

- **`routes/routes.js`**: define las URLs disponibles y qué función
  atiende cada una. No contiene lógica.
- **`controllers/controller.js`**: recibe la petición HTTP, le pide el
  dato al servicio, y decide el código de estado (`200`, `404`, `500`)
  con el que responde.
- **`services/service.js`**: contiene el dato/lógica de negocio. No sabe
  nada de HTTP, por lo que se podría reutilizar o probar de forma
  independiente.

Además se agregó manejo de rutas no encontradas (`404`) y un manejador
de errores global (`500`), para no depender de las respuestas por
defecto de Express.

## 3. Cómo correrlo desde cero

Esto está pensado para que la ejecucion sea totalmente facil de hacer sin el mayor esfuerzo posible, vamos paso por paso. No necesitas saber nada de
antemano, solo ir copiando los comandos en tu terminal.

### Lo que necesitas tener instalado antes de empezar

- **Node.js** (versión 20 o superior). Si no lo tienes, descárgalo de
  [nodejs.org](https://nodejs.org) e instálalo como cualquier programa.
- Puedes confirmar que ya lo tienes corriendo esto en tu terminal:

  ```bash
  node -v
  ```

  Si te devuelve algo como `v20.x.x`, vas bien.

### Paso a paso para levantar el proyecto

1. **Abre una terminal** (en Windows: PowerShell o CMD; en Mac/Linux:
   Terminal).
2. **Muévete hasta la carpeta del proyecto** con el comando `cd`,
   apuntando a donde descargaste o clonaste este repositorio:

   ```bash
   cd ruta/a/basico/ejercicio-01/resoluciones/estiben-ixen
   ```

3. **Instala las dependencias.** Este comando lee el archivo
   `package.json` y descarga todo lo necesario (en este caso, Express)
   dentro de una carpeta llamada `node_modules/`. Solo se hace una vez:

   ```bash
   npm install
   ```

4. **Levanta el servidor:**

   ```bash
   npm start
   ```

   Si todo salió bien, vas a ver este mensaje en la terminal y **se va
   a quedar ahí, sin volver a mostrarte el símbolo de comandos**. Eso
   es normal, significa que el servidor sigue encendido y escuchando:

   ```text
   servidor RPG escuchando en http://localhost:3000
   ```

5. **No cierres esa terminal.** Ábrela una segunda, nueva, para probar
   que el servidor responde. Ahí puedes usar tu navegador o el
   comando `curl`:

   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/basico/ejercicio-01
   ```

   (En Windows, si `curl` te da problemas, usa `curl.exe` en su lugar).

   También puedes simplemente abrir en tu navegador:
   `http://localhost:3000/basico/ejercicio-01`

### Cómo detener todo correctamente

Cuando termines de probar, para no dejar el puerto ocupado ni procesos
sueltos corriendo en tu computadora:

1. Ve a la terminal donde sigue corriendo `npm start` (la primera).
2. Presiona **`Ctrl + C`**. Eso apaga el servidor de forma segura.
3. Confirma que volvió a aparecer el símbolo normal de comandos en esa
   terminal — eso indica que ya no hay nada corriendo.
4. Puedes cerrar ambas terminales sin problema después de esto.

Si alguna vez ves un error de tipo `EADDRINUSE` al volver a correr
`npm start`, significa que dejaste una versión anterior del servidor
corriendo en otra terminal sin apagarla — solo búscala y detenla con
`Ctrl + C`.

## 4. Estructura del proyecto

```text
estiben-ixen/
├── package.json
├── package-lock.json
├── .gitignore
├── README.md
└── src/
    ├── app.js                    # arranca el servidor y conecta las rutas
    ├── routes/
    │   └── routes.js             # define las URLs disponibles
    ├── controllers/
    │   └── controller.js         # decide la respuesta HTTP
    └── services/
        └── service.js            # datos y lógica de negocio
```

## 5. Conclusiones

Este ejercicio, aunque pequeño, sirvió para entender el flujo completo
de una API en Node.js/Express: cómo una petición viaja desde la ruta,
pasa por el controlador, llega al servicio, y regresa como respuesta
HTTP con un código de estado correcto. También dejó claro algo que no
esperaba: la mayoría de los errores al principio no son de "no saber
programar", sino de detalles finos —una barra mal puesta, un prefijo
duplicado, un archivo no guardado— y que aprender a leer el mensaje de
error completo (en vez de adivinar) es una habilidad tan importante
como escribir el código mismo. De aquí en adelante, cada ejercicio va a
sumar una capa más sobre esta misma base: rutas, controladores y
servicios separados, y buen manejo de errores desde el principio.