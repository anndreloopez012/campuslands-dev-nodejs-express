# Básico 24 - CRUD básico

## Descripción

API desarrollada con Node.js y Express para administrar fórmulas químicas.

El ejercicio implementa las operaciones básicas de un CRUD utilizando datos almacenados temporalmente en memoria.

## CRUD

* Create: crear una fórmula.
* Read: consultar fórmulas.
* Update: actualizar una fórmula.
* Delete: eliminar una fórmula.

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
├── controllers/
└── services/
```

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

### Listar fórmulas

```text
GET /formulas
```

### Obtener una fórmula

```text
GET /formulas/1
```

### Crear fórmula

```text
POST /formulas
```

Body:

```json
{
  "nombre": "Sal",
  "formula": "NaCl"
}
```

### Actualizar fórmula

```text
PUT /formulas/1
```

Body:

```json
{
  "nombre": "Agua modificada",
  "formula": "H2O"
}
```

### Eliminar fórmula

```text
DELETE /formulas/1
```

## Errores

Si una fórmula no existe, se responde con `404`.

Si faltan datos para crear o actualizar, se responde con `400`.

## Concepto aprendido

El ejercicio demuestra las cuatro operaciones básicas de un CRUD utilizando datos en memoria y separando las responsabilidades entre rutas, controladores y servicios.
