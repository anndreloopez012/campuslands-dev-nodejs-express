# Ejercicio 17 - Rutas GET

## Descripción

Mini API creada con Node.js y Express para practicar rutas GET utilizando una temática de viajes y turismo.

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

Respuesta:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "rutas GET"
}
```

### Listar destinos

```http
GET /destinos
```

Respuesta:

```json
{
  "ok": true,
  "destinos": [
    {
      "id": 1,
      "ciudad": "París",
      "pais": "Francia"
    },
    {
      "id": 2,
      "ciudad": "Cancún",
      "pais": "México"
    },
    {
      "id": 3,
      "ciudad": "Madrid",
      "pais": "España"
    }
  ]
}
```

## Estructura

* `app.js`: configura Express.
* `server.js`: inicia el servidor.
* `routes`: define las rutas GET.
* `controllers`: procesa las peticiones.
* `services`: contiene los datos.

## Tecnologías

* Node.js
* Express
* JavaScript
