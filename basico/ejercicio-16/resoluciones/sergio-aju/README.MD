# Ejercicio 16 - Primer servidor Express

## Descripción

Mini API creada con Node.js y Express para practicar la creación de un servidor HTTP, rutas, controladores y servicios.

La temática utilizada es ropa y sneakers.

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

El servidor funciona en:

```text
http://localhost:3000
```

## Rutas

### Health

```http
GET /health
```

Respuesta:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "primer servidor Express"
}
```

### Ropa

```http
GET /ropa
```

Respuesta:

```json
{
  "ok": true,
  "ropa": [
    {
      "id": 1,
      "nombre": "Camiseta",
      "precio": 25
    },
    {
      "id": 2,
      "nombre": "Sneakers",
      "precio": 80
    }
  ]
}
```

## Estructura

* `app.js`: configura Express.
* `server.js`: inicia el servidor.
* `routes`: define las rutas.
* `controllers`: maneja las peticiones y respuestas.
* `services`: contiene la lógica y los datos.

## Tecnologías

* Node.js
* Express
* JavaScript
