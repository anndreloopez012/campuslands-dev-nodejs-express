# Básico 23 - Datos en memoria

## Descripción

API sencilla desarrollada con Node.js y Express sobre el tema de soldadura.

El objetivo es practicar el almacenamiento temporal de información utilizando datos en memoria.

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
├── controllers/
└── services/
```

## Concepto principal

Los soldadores se almacenan temporalmente en un arreglo de JavaScript.

No se utiliza una base de datos ni archivos externos.

Los datos se pierden cuando el servidor se reinicia.

## Instalación

```bash
npm install
```

## Ejecutar

```bash
npm run dev
```

Servidor:

```text
http://localhost:3000
```

## Endpoints

### Health

```text
GET /health
```

### Listar soldadores

```text
GET /soldadores
```

### Crear soldador

```text
POST /soldadores
```

Body:

```json
{
  "nombre": "Pedro",
  "especialidad": "Soldadura eléctrica"
}
```

Si falta el nombre o la especialidad, la API responde con estado `400`.

## Concepto aprendido

Los datos en memoria permiten almacenar información temporalmente utilizando estructuras de JavaScript como arreglos.

Este método es sencillo para practicar una API, pero no es adecuado para almacenar información de forma permanente.
