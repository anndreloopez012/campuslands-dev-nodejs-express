# Basico 26 - codigos de estado

Tematica: shooters competitivos

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
curl http://localhost:3000/basico/ejercicio-26
curl http://localhost:3000/basico/ejercicio-26/armas
curl -X POST http://localhost:3000/basico/ejercicio-26/armas -H "Content-Type: application/json" -d "{\"nombre\":\"M4A1\",\"dano\":33}"
curl -X POST http://localhost:3000/basico/ejercicio-26/armas -H "Content-Type: application/json" -d "{\"nombre\":\"AWP\",\"dano\":115}"
curl -X POST http://localhost:3000/basico/ejercicio-26/armas -H "Content-Type: application/json" -d "{\"nombre\":\"\",\"dano\":-1}"
curl -X DELETE http://localhost:3000/basico/ejercicio-26/armas/3
curl -X DELETE http://localhost:3000/basico/ejercicio-26/armas/99
curl -i http://localhost:3000/basico/ejercicio-26/estados/401
curl -i http://localhost:3000/basico/ejercicio-26/estados/500
curl -i http://localhost:3000/basico/ejercicio-26/estados/204
curl http://localhost:3000/basico/ejercicio-26/estados/418
```

## Codigos usados

- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request
- 401 Unauthorized
- 404 Not Found
- 409 Conflict
- 500 Internal Server Error
