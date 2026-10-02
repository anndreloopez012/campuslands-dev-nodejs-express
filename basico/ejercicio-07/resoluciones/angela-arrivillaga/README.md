# Basico 07 - process.argv y CLI

Tematica: autos de lujo

## Instalar

```bash
npm install
```

## Ejecutar

```bash
npm run dev
```

El servidor corre en http://localhost:3000

## Probar

```bash
curl http://localhost:3000/basico/ejercicio-07
curl http://localhost:3000/basico/ejercicio-07/autos
curl "http://localhost:3000/basico/ejercicio-07/autos?marca=Bentley"
curl "http://localhost:3000/basico/ejercicio-07/autos?marca=Ferrari"
```

## CLI

```bash
node src/cli.js listar
node src/cli.js buscar Bentley
node src/cli.js buscar
node src/cli.js hola
```
