# Basico 27 - logs simples

Tematica: MOBA esports

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
curl http://localhost:3000/basico/ejercicio-27
curl http://localhost:3000/basico/ejercicio-27/campeones
curl http://localhost:3000/basico/ejercicio-27/campeones/2
curl http://localhost:3000/basico/ejercicio-27/campeones/99
curl http://localhost:3000/basico/ejercicio-27/logs
```

## Logs

Cada peticion se imprime en la consola y se guarda en `logs/app.log` con este formato:

```text
2026-01-01T10:00:00.000Z GET /basico/ejercicio-27/campeones 200 3ms
```

La carpeta `logs/` esta en el `.gitignore` y no se sube al repositorio.
