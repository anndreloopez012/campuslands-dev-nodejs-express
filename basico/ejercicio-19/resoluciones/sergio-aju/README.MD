# Ejercicio 19 - req.params y req.query

## Descripción

Mini API creada con Node.js y Express para practicar `req.params` y `req.query` utilizando una temática de tatuajes.

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

### Buscar tatuaje por ID

```http
GET /tatuajes/:id
```

Ejemplo:

```text
GET /tatuajes/1
```

Esta ruta utiliza `req.params.id`.

### Buscar por estilo

```http
GET /tatuajes/buscar?estilo=realista
```

Esta ruta utiliza `req.query.estilo`.

## Diferencia

`req.params` obtiene valores que forman parte de la URL.

Ejemplo:

```text
/tatuajes/1
```

`req.query` obtiene valores enviados después de `?`.

Ejemplo:

```text
/tatuajes/buscar?estilo=realista
```

## Errores

Si se solicita un tatuaje que no existe, la API responde con `404 Not Found`.

## Estructura

* `app.js`: configura Express.
* `server.js`: inicia el servidor.
* `routes`: define las rutas.
* `controllers`: obtiene los parámetros y prepara la respuesta.
* `services`: realiza las búsquedas.

## Tecnologías

* Node.js
* Express
* JavaScript
