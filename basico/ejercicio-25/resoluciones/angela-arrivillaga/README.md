# Basico 25 - respuestas HTTP correctas

Tematica: videojuegos RPG

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
curl http://localhost:3000/basico/ejercicio-25
curl http://localhost:3000/basico/ejercicio-25/personajes
curl http://localhost:3000/basico/ejercicio-25/personajes/2
curl http://localhost:3000/basico/ejercicio-25/personajes/99
curl http://localhost:3000/basico/ejercicio-25/personajes/abc
curl -X POST http://localhost:3000/basico/ejercicio-25/personajes -H "Content-Type: application/json" -d "{\"nombre\":\"Merlin\",\"clase\":\"mago\",\"nivel\":70}"
curl -X POST http://localhost:3000/basico/ejercicio-25/personajes -H "Content-Type: application/json" -d "{\"nombre\":\"X\",\"clase\":\"pirata\",\"nivel\":500}"
```

## Formato de las respuestas

Exito:

```json
{ "ok": true, "message": "Personaje encontrado", "data": { } }
```

Error:

```json
{ "ok": false, "message": "Personaje no encontrado", "data": null }
```
