# Basico 13 - manejo de errores

Tematica: ciencia ficcion

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
curl http://localhost:3000/basico/ejercicio-13
curl http://localhost:3000/basico/ejercicio-13/naves/1
curl http://localhost:3000/basico/ejercicio-13/naves/99
curl http://localhost:3000/basico/ejercicio-13/naves/abc
curl "http://localhost:3000/basico/ejercicio-13/parsear?texto={\"clave\":1}"
curl "http://localhost:3000/basico/ejercicio-13/parsear?texto=hola"
curl http://localhost:3000/basico/ejercicio-13/fallar
```
