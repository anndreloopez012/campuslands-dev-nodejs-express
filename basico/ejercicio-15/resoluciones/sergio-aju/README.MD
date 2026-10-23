# Básico 15 - Mini API HTTP nativa

## Descripción

Mini API creada con Node.js utilizando el módulo HTTP nativo, sin Express.

La temática utilizada es comida urbana.

## Tecnologías

* Node.js
* Módulo `http` de Node.js

## Instalación

No necesita dependencias externas.

## Ejecución

```bash
npm run dev
```

También se puede ejecutar con:

```bash
npm start
```

## Endpoint

### Obtener comidas

```http
GET /comida
```

Respuesta:

```json
{
  "ok": true,
  "comida": [
    {
      "nombre": "Hamburguesa",
      "precio": 25
    },
    {
      "nombre": "Tacos",
      "precio": 20
    }
  ]
}
```

### Ruta inexistente

Si se solicita una ruta que no existe:

```http
GET /pizza
```

La API responde con:

```json
{
  "ok": false,
  "message": "Ruta no encontrada"
}
```

y utiliza el estado HTTP `404`.

## Concepto principal

El ejercicio demuestra cómo crear una API HTTP básica utilizando directamente el módulo `http` de Node.js, sin utilizar Express.

Se comprueba la URL y el método HTTP para decidir qué respuesta enviar.
