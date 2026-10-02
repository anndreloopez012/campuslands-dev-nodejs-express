# Basico 22 - servicios simples

Tematica: arquitectura 3D

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
curl http://localhost:3000/basico/ejercicio-22
curl http://localhost:3000/basico/ejercicio-22/proyectos
curl http://localhost:3000/basico/ejercicio-22/proyectos/2
curl http://localhost:3000/basico/ejercicio-22/proyectos/99
curl "http://localhost:3000/basico/ejercicio-22/calculos/area?ancho=5&largo=8"
curl "http://localhost:3000/basico/ejercicio-22/calculos/volumen?ancho=5&largo=8&alto=3"
curl "http://localhost:3000/basico/ejercicio-22/calculos/costo?ancho=5&largo=8&precio=120"
curl "http://localhost:3000/basico/ejercicio-22/calculos/area?ancho=-1&largo=abc"
```
