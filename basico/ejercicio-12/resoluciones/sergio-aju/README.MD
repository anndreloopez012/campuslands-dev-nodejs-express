# Básico 12 - Async Await

## Descripción

Ejercicio de Node.js y Express para practicar el uso de `async` y `await` mediante una API sencilla relacionada con películas de miedo.

## Tecnologías

* Node.js
* Express
* JavaScript ES Modules

## Instalación

```bash
npm install
```

## Ejecución

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

## Endpoints

### Health

```http
GET /health
```

Respuesta:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "async await"
}
```

### Películas

```http
GET /peliculas
```

Respuesta:

```json
{
  "ok": true,
  "peliculas": [
    {
      "id": 1,
      "titulo": "El Conjuro",
      "genero": "Terror"
    },
    {
      "id": 2,
      "titulo": "It",
      "genero": "Terror"
    },
    {
      "id": 3,
      "titulo": "Siniestro",
      "genero": "Terror"
    }
  ]
}
```

## Concepto principal

El ejercicio demuestra el uso de `async` y `await`.

La función `buscarPeliculas()` es asíncrona y utiliza `await` para esperar una operación que tarda un segundo.

El controlador también es una función `async` y utiliza `await` para esperar el resultado del servicio.

## Prueba

Abrir en el navegador:

```text
http://localhost:3000/health
```

y:

```text
http://localhost:3000/peliculas
```

La ruta `/peliculas` tarda aproximadamente un segundo porque se está simulando una operación asíncrona.
