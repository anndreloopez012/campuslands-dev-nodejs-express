# BASICO 07 - process.argv y CLI

## Descripción

Ejercicio básico para aprender a recibir datos desde la terminal usando `process.argv`.

## Instalación

```bash
npm install
```

## Ejecutar

```bash
node src/app.js BMW
```

Resultado:

```text
Auto seleccionado: BMW
```

También se puede usar:

```bash
npm start -- Ferrari
```

## Error

Si no se indica un auto:

```bash
node src/app.js
```

Muestra:

```text
Debes indicar un auto.
```

## Estructura

```text
src/
└── app.js
```

## Concepto utilizado

Se utiliza:

```js
process.argv[2]
```

para obtener el argumento escrito desde la terminal.
