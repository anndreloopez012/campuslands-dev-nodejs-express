# Básico 14 - Validación de entrada

## Descripción

API sencilla de Node.js y Express para practicar la validación de datos recibidos mediante `req.body`.

El ejercicio utiliza libros como temática.

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm run dev
```

## Endpoint

### Crear libro

```http
POST /libros
```

Ejemplo correcto:

```json
{
  "titulo": "El principito",
  "autor": "Antoine de Saint-Exupéry"
}
```

Respuesta:

```json
{
  "ok": true,
  "libro": {
    "id": 1,
    "titulo": "El principito",
    "autor": "Antoine de Saint-Exupéry"
  }
}
```

## Validación

Si falta el título o el autor:

```json
{
  "titulo": "El principito"
}
```

La API responde:

```json
{
  "ok": false,
  "message": "El titulo y el autor son obligatorios"
}
```

El estado HTTP utilizado es `400 Bad Request`.

## Concepto principal

El ejercicio practica la validación de entrada antes de procesar los datos.

Se comprueba que `titulo` y `autor` estén presentes antes de guardar el libro.
