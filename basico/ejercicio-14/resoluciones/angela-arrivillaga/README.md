# Basico 14 - validacion de entrada

Tematica: libros

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
curl http://localhost:3000/basico/ejercicio-14
curl http://localhost:3000/basico/ejercicio-14/libros
curl -X POST http://localhost:3000/basico/ejercicio-14/libros -H "Content-Type: application/json" -d "{\"titulo\":\"El Principito\",\"autor\":\"Antoine de Saint-Exupery\",\"paginas\":96,\"anio\":1943}"
curl -X POST http://localhost:3000/basico/ejercicio-14/libros -H "Content-Type: application/json" -d "{\"titulo\":\"A\",\"paginas\":-5,\"anio\":3000}"
```
