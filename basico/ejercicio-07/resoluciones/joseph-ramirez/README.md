# BASICO 07 - process.argv y CLI

## Autor

Joseph Ramirez

## Temática

Autos de lujo.

## Objetivo

Crear una pequeña solución backend con Node.js y Express que permita practicar el uso de `process.argv` para recibir argumentos desde la línea de comandos.

El proyecto contiene una CLI para listar autos y buscar autos por marca.

También contiene una API Express para aplicar una estructura backend organizada mediante rutas, controladores y servicios.

---

# Tecnologías utilizadas

* Node.js
* Express
* JavaScript
* CommonJS
* `process.argv`
* CLI
* JSON

Se recomienda utilizar Node.js 20 o superior.

---

# Estructura del proyecto

```text
joseph-ramirez/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── data/
│   └── cars.json
└── src/
    ├── app.js
    ├── cli.js
    ├── routes/
    │   └── cars.routes.js
    ├── controllers/
    │   └── cars.controller.js
    └── services/
        └── cars.service.js
```

---

# Responsabilidad de cada archivo

## `src/app.js`

Es el punto de entrada del servidor Express.

Se encarga de:

* Crear la aplicación Express.
* Configurar JSON.
* Registrar las rutas.
* Crear el endpoint `/health`.
* Manejar rutas inexistentes.
* Iniciar el servidor.

---

## `src/cli.js`

Es el punto de entrada de la aplicación CLI.

Utiliza:

```javascript
process.argv
```

para recibir comandos desde la terminal.

Los comandos disponibles son:

```text
listar
buscar
ayuda
```

---

## `src/services/cars.service.js`

Contiene la lógica relacionada con los autos.

Permite:

* Obtener todos los autos.
* Buscar autos por marca.

La CLI y la API reutilizan este servicio.

---

## `src/controllers/cars.controller.js`

Se encarga de recibir las peticiones HTTP y generar las respuestas correspondientes.

---

## `src/routes/cars.routes.js`

Define las rutas relacionadas con los autos:

```text
GET /cars
GET /cars/:brand
```

---

## `data/cars.json`

Contiene los datos sintéticos de los autos de lujo.

---

# Instalación

Desde la carpeta:

```text
basico/ejercicio-07/resoluciones/joseph-ramirez/
```

ejecutar:

```bash
npm install
```

Esto instala Express y las dependencias necesarias.

No se debe subir:

```text
node_modules/
```

al repositorio.

---

# Ejecución del servidor

## Modo normal

Ejecutar:

```bash
npm start
```

El servidor debe mostrar:

```text
Servidor ejecutandose en http://localhost:3000
```

---

## Modo desarrollo

Ejecutar:

```bash
npm run dev
```

Este comando utiliza:

```text
node --watch
```

para reiniciar automáticamente el servidor cuando se realizan cambios.

---

# Verificación de sintaxis

Ejecutar:

```bash
npm run check
```

Si no existen errores de sintaxis, Node.js terminará el comando correctamente.

---

# CLI

El script de la CLI está definido en `package.json`:

```json
"cli": "node src/cli.js"
```

Los argumentos se agregan después de:

```text
--
```

Por ejemplo:

```bash
npm run cli -- listar
```

---

# Prueba 1 - Mostrar ayuda

Ejecutar:

```bash
npm run cli -- ayuda
```

También se puede ejecutar:

```bash
npm run cli
```

Resultado esperado:

```text
CLI - Autos de lujo

Comandos disponibles:

  npm run cli -- listar
  npm run cli -- buscar Ferrari
  npm run cli -- buscar Porsche
  npm run cli -- ayuda
```

---

# Prueba 2 - Listar autos

Ejecutar:

```bash
npm run cli -- listar
```

Resultado esperado:

```text
Autos de lujo disponibles:

Ferrari 488 GTB - 2022 - $280000
Lamborghini Huracan - 2023 - $310000
Porsche 911 Turbo S - 2024 - $230000
Aston Martin DB12 - 2024 - $245000
McLaren Artura - 2024 - $237000
```

---

# Prueba 3 - Buscar Ferrari

Ejecutar:

```bash
npm run cli -- buscar Ferrari
```

Resultado esperado:

```text
Autos encontrados para Ferrari:

Ferrari 488 GTB - 2022 - $280000
```

---

# Prueba 4 - Buscar Porsche

Ejecutar:

```bash
npm run cli -- buscar Porsche
```

Resultado esperado:

```text
Autos encontrados para Porsche:

Porsche 911 Turbo S - 2024 - $230000
```

---

# Prueba 5 - Buscar una marca inexistente

Ejecutar:

```bash
npm run cli -- buscar Toyota
```

Resultado esperado:

```text
No se encontraron autos de la marca: Toyota
```

Esto demuestra el manejo de una búsqueda válida pero sin resultados.

---

# Prueba 6 - Buscar sin indicar una marca

Ejecutar:

```bash
npm run cli -- buscar
```

Resultado esperado:

```text
Error: debes indicar una marca.
Ejemplo: npm run cli -- buscar Ferrari
```

Esto demuestra una validación básica de los argumentos.

---

# Prueba 7 - Comando inexistente

Ejecutar:

```bash
npm run cli -- eliminar Ferrari
```

Resultado esperado:

```text
Comando no reconocido: eliminar
```

Después se debe mostrar la ayuda de la CLI.

---

# `process.argv`

`process.argv` permite acceder a los argumentos proporcionados al ejecutar un programa Node.js desde la terminal.

Por ejemplo:

```bash
node src/cli.js buscar Ferrari
```

Node recibe información en:

```javascript
process.argv
```

Los valores relevantes serían:

```text
process.argv[2] → buscar
process.argv[3] → Ferrari
```

En el proyecto se utiliza:

```javascript
const args = process.argv.slice(2);
```

para obtener únicamente los argumentos enviados por el usuario.

El resultado sería:

```javascript
[
  "buscar",
  "Ferrari"
]
```

Por lo tanto:

```javascript
args[0]
```

contiene:

```text
buscar
```

y:

```javascript
args[1]
```

contiene:

```text
Ferrari
```

---

# Flujo de la CLI

Cuando se ejecuta:

```bash
npm run cli -- buscar Ferrari
```

el flujo es:

```text
Terminal
   │
   ▼
npm run cli
   │
   ▼
src/cli.js
   │
   ▼
process.argv
   │
   ▼
["buscar", "Ferrari"]
   │
   ▼
switch(command)
   │
   ▼
searchCars("Ferrari")
   │
   ▼
cars.service.js
   │
   ▼
cars.json
   │
   ▼
Resultado en consola
```

---

# API Express

El proyecto también cuenta con una API HTTP.

## Health check

Ejecutar el servidor:

```bash
npm start
```

Después realizar:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "process.argv y CLI"
}
```

---

# Obtener todos los autos

Realizar:

```bash
curl http://localhost:3000/cars
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Autos obtenidos correctamente",
  "total": 5,
  "data": [
    {
      "id": 1,
      "marca": "Ferrari",
      "modelo": "488 GTB",
      "anio": 2022,
      "precio": 280000
    },
    {
      "id": 2,
      "marca": "Lamborghini",
      "modelo": "Huracan",
      "anio": 2023,
      "precio": 310000
    },
    {
      "id": 3,
      "marca": "Porsche",
      "modelo": "911 Turbo S",
      "anio": 2024,
      "precio": 230000
    },
    {
      "id": 4,
      "marca": "Aston Martin",
      "modelo": "DB12",
      "anio": 2024,
      "precio": 245000
    },
    {
      "id": 5,
      "marca": "McLaren",
      "modelo": "Artura",
      "anio": 2024,
      "precio": 237000
    }
  ]
}
```

---

# Buscar una marca mediante la API

Ejecutar:

```bash
curl http://localhost:3000/cars/Ferrari
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Autos encontrados correctamente",
  "total": 1,
  "data": [
    {
      "id": 1,
      "marca": "Ferrari",
      "modelo": "488 GTB",
      "anio": 2022,
      "precio": 280000
    }
  ]
}
```

También se puede probar:

```bash
curl http://localhost:3000/cars/Porsche
```

---

# Marca inexistente en la API

Ejecutar:

```bash
curl http://localhost:3000/cars/Toyota
```

La respuesta debe tener código:

```text
404
```

y:

```json
{
  "ok": false,
  "message": "No se encontraron autos de esa marca"
}
```

---

# Ruta inexistente

Ejecutar:

```bash
curl http://localhost:3000/vehicles
```

La respuesta debe tener código:

```text
404
```

y:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

---

# CLI y API

La CLI recibe los datos desde la terminal:

```text
process.argv
```

Ejemplo:

```bash
npm run cli -- buscar Ferrari
```

La API recibe los datos mediante HTTP:

```text
GET /cars/Ferrari
```

Ambos utilizan:

```text
cars.service.js
```

para evitar duplicar la lógica.

La arquitectura queda:

```text
                  ┌── CLI
                  │
Entrada ──────────┤
                  │
                  └── API Express
                         │
                         ▼
                  cars.service.js
                         │
                         ▼
                     cars.json
```

---

# Códigos HTTP

| Código | Situación                        |
| -----: | -------------------------------- |
|    200 | Petición procesada correctamente |
|    404 | Marca o ruta inexistente         |
|    400 | Entrada HTTP inválida            |

La CLI no utiliza códigos HTTP porque funciona directamente desde la terminal.

---

# Checklist de validación

La entrega está correcta si:

* [x] Tiene `package.json`.
* [x] Tiene `README.md`.
* [x] Tiene carpeta `src/`.
* [x] Utiliza Node.js.
* [x] Utiliza `process.argv`.
* [x] Tiene una CLI funcional.
* [x] Tiene los comandos `listar`, `buscar` y `ayuda`.
* [x] Valida comandos desconocidos.
* [x] Valida búsquedas sin marca.
* [x] Utiliza Express.
* [x] Tiene `/health`.
* [x] Tiene `/cars`.
* [x] Permite buscar autos por marca.
* [x] Separa rutas, controladores y servicios.
* [x] Utiliza datos sintéticos.
* [x] Tiene scripts `start`, `dev`, `cli` y `check`.
* [x] Maneja errores HTTP.
* [x] No utiliza una base de datos externa.
* [x] No incluye `node_modules/`.

---

# Reglas de entrega

La solución debe permanecer dentro de:

```text
basico/ejercicio-07/resoluciones/joseph-ramirez/
```

No modificar archivos base del ejercicio.

No eliminar entregas de otros estudiantes.

No subir:

```text
node_modules/
```

No subir archivos `.env` con secretos reales.

El Pull Request debe apuntar a:

```text
dev
```

y no a:

```text
main
```

---

# Resultado esperado

El proyecto debe demostrar que se comprende el uso de:

```javascript
process.argv
```

para recibir argumentos desde la línea de comandos.

El flujo principal es:

```text
Comando de terminal
       ↓
process.argv
       ↓
Validación
       ↓
Comando
       ↓
Servicio
       ↓
Resultado
```

El concepto central de BASICO 07 es comprender cómo una aplicación Node.js puede recibir instrucciones directamente desde la línea de comandos mediante `process.argv`.
