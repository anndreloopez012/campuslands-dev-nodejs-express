# Básico 11 - Promesas básicas

## Descripción

Ejercicio de Node.js y Express para practicar el uso de Promesas mediante una API sencilla relacionada con música.

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

### Verificar servidor

```http
GET /health
```

### Obtener músicas

```http
GET /musicas
```

Ejemplo de respuesta:

```json
{
  "ok": true,
  "musicas": [
    {
      "id": 1,
      "nombre": "Blinding Lights",
      "artista": "The Weeknd"
    },
    {
      "id": 2,
      "nombre": "Shape of You",
      "artista": "Ed Sheeran"
    }
  ]
}
```

## Concepto principal

El servicio `buscarMusicas()` utiliza una Promesa para simular una operación asíncrona.

El controlador utiliza `await` para esperar el resultado de la Promesa y luego enviar la respuesta HTTP.

## Prueba

Abrir:

```text
http://localhost:3000/health
```

y:

```text
http://localhost:3000/musicas
```
