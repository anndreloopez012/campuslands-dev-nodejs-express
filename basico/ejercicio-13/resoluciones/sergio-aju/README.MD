# Básico 13 - Manejo de errores

## Descripción

API sencilla de Node.js y Express para practicar el manejo de errores con películas de ciencia ficción.

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm run dev
```

## Endpoints

### Obtener película

```http
GET /peliculas/1
```

Ejemplo de respuesta correcta:

```json
{
  "ok": true,
  "pelicula": {
    "id": 1,
    "titulo": "Interestelar"
  }
}
```

### Película inexistente

```http
GET /peliculas/99
```

Respuesta:

```json
{
  "ok": false,
  "message": "Película no encontrada"
}
```

## Concepto principal

El ejercicio utiliza `try/catch`, `throw` y un middleware de errores de Express.

Cuando una película no existe, el servicio genera un error y el controlador lo envía al manejador de errores.
