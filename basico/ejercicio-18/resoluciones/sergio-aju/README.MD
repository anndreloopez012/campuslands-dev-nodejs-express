# Ejercicio 18 - Rutas POST

## Descripción

Mini API creada con Node.js y Express para practicar rutas POST utilizando una temática de paracaidismo.

El ejercicio permite registrar un paracaidista enviando información mediante JSON.

## Instalación

```bash
npm install
```

## Ejecutar

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

Servidor:

```text
http://localhost:3000
```

## Rutas

### Health

```http
GET /health
```

### Crear paracaidista

```http
POST /paracaidistas
```

Body:

```json
{
  "nombre": "Carlos",
  "nivel": "Avanzado"
}
```

Respuesta correcta:

```json
{
  "ok": true,
  "paracaidista": {
    "id": 1,
    "nombre": "Carlos",
    "nivel": "Avanzado"
  }
}
```

## Validación

Si falta `nombre` o `nivel`, la API responde con estado `400`.

## Estructura

* `app.js`: configura Express.
* `server.js`: inicia el servidor.
* `routes`: define la ruta POST.
* `controllers`: recibe y valida los datos.
* `services`: crea el paracaidista.

## Tecnologías

* Node.js
* Express
* JavaScript
