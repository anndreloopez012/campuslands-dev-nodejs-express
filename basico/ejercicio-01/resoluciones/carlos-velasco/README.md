# Ejercicio 01 — Node.js + Express

Implementación básica de una aplicación Node.js utilizando **ES Modules**, **Express**, separación de responsabilidades y manejo de datos mediante servicios.

## Requisitos

* Node.js
* npm

## Ubicación del proyecto

```bash
cd ./campuslands-dev-nodejs-express/basico/ejercicio-01/resoluciones/carlos-velasco
```

## Instalación

Instalar las dependencias:

```bash
npm install
```

## Ejecución

### Modo desarrollo

```bash
npm run dev
```

Ejecuta el servidor utilizando `node --watch` para detectar cambios automáticamente.

### Modo producción

```bash
npm start
```

## Estructura

```text
src/
├── app.js
├── server.js
├── data/
│   └── data.js
└── services/
    └── service.js
```

### Responsabilidades

* `app.js` — Configura Express y define los endpoints de la API.
* `server.js` — Inicia el servidor Express en el puerto `3000`.
* `services/service.js` — Obtiene, valida y procesa los datos.
* `data/data.js` — Contiene los datos sintéticos de usuarios.

## Endpoints

### GET `/`

Verifica que la API esté funcionando correctamente.

```bash
curl http://localhost:3000/
```

Respuesta:

```text
API funcionando correctamente
```

### GET `/usuarios`

Obtiene y devuelve los usuarios almacenados en `data.js`.

```bash
curl http://localhost:3000/usuarios
```

La respuesta contiene los 5 usuarios en formato JSON.

## Pruebas realizadas

### Servidor Express

Se ejecutó:

```bash
npm run dev
```

Resultado:

```text
Servidor ejecutándose en http://localhost:3000
```

### Endpoint principal

Se comprobó:

```bash
curl http://localhost:3000/
```

Resultado:

```text
API funcionando correctamente
```

### Endpoint de usuarios

Se comprobó:

```bash
curl http://localhost:3000/usuarios
```

Resultado: correcto. La API devuelve los 5 usuarios almacenados en `data.js` en formato JSON.

### Validación de módulos

Se comprobó el funcionamiento de:

* `import` / `export` mediante ES Modules.
* Importación de `data.js` desde `service.js`.
* Importación de `obtenerUsuarios()` desde `app.js`.
* Comunicación entre módulos.
* Retorno de los datos desde el servicio hacia el endpoint Express.

## Configuración

El proyecto utiliza ES Modules mediante:

```json
"type": "module"
```

Scripts configurados:

```json
"scripts": {
  "dev": "node --watch src/server.js",
  "start": "node src/server.js"
}
```

Dependencia principal:

```json
"express": "^5.2.1"
```

## Estado de entrega

* [x] Estructura del proyecto organizada.
* [x] Datos sintéticos creados.
* [x] Servicio para obtener y validar datos.
* [x] Comunicación entre módulos mediante `import` / `export`.
* [x] `package.json` configurado con ES Modules.
* [x] Scripts `dev` y `start` configurados.
* [x] Servidor Express funcionando.
* [x] Endpoint principal funcionando.
* [x] Endpoint `/usuarios` funcionando.
* [x] Manejo básico de errores.
* [x] Validación básica de datos.
* [x] README de entrega.
* [x] PR hacia `dev`.
