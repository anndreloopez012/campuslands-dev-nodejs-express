# Ejercicio 07 - process.argv y CLI (Juan Lema)

## Que hace

Tematica autos de lujo. `quote.service.js` parsea flags tipo `--brand=Ferrari --price=250000` desde `process.argv`, valida y calcula el impuesto de lujo (8%) y el total.

## Como ejecutar

```bash
npm install
npm start -- --brand=Ferrari --price=250000
```

O directo:

```bash
node src/app.js --brand=Ferrari --price=250000
```

## Como probar el caso de error

```bash
node src/app.js --brand=Ferrari
```

Debe imprimir `Error al cotizar: --price debe ser un numero mayor a 0`.

## Estructura

```text
src/
├── app.js
└── services/
    └── quote.service.js
```
