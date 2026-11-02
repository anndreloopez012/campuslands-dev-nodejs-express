# Básico 22 - Servicios simples

## Descripción

API sencilla desarrollada con Node.js y Express sobre arquitectura 3D.

El objetivo es practicar el uso de servicios simples y la separación entre rutas, controladores y lógica de datos.

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
├── controllers/
└── services/
```

## Responsabilidades

### Routes

Define las rutas de la API.

### Controllers

Recibe las peticiones y devuelve las respuestas HTTP.

### Services

Contiene la lógica y los datos de los modelos 3D.

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

## Probar

### Health

```text
GET /health
```

### Obtener modelos

```text
GET /modelos
```

Respuesta:

```json
{
  "ok": true,
  "modelos": [
    {
      "id": 1,
      "nombre": "Casa moderna",
      "tipo": "Arquitectura 3D"
    }
  ]
}
```

## Concepto aprendido

El service permite separar la lógica y los datos del controller.

El controller solicita la información al service y luego se encarga de devolver la respuesta HTTP.
