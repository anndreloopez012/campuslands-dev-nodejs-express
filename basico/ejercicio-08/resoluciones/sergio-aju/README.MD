# BASICO 08 - Variables de entorno

## Descripción

Ejercicio básico para aprender a utilizar variables de entorno en Node.js.

Se utiliza un archivo `.env` para guardar el puerto y el nombre de un hiperdeportivo.

## Instalación

```bash
npm install
```

## Ejecutar

```bash
npm run dev
```

## Rutas

### GET /health

Comprueba que el servidor funciona.

### GET /car

Muestra el nombre del auto guardado en la variable de entorno.

```text
http://localhost:3000/car
```

## Variables

El archivo `.env` contiene:

```text
PORT=3000
CAR_NAME=Bugatti Chiron
```

El archivo `.env` no se sube a GitHub.
