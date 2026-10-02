# Basico 28 - configuracion por entorno

Tematica: battle royale

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
curl http://localhost:3000/basico/ejercicio-28
curl http://localhost:3000/basico/ejercicio-28/config
curl http://localhost:3000/basico/ejercicio-28/partidas
curl http://localhost:3000/basico/ejercicio-28/partidas/1
curl http://localhost:3000/basico/ejercicio-28/partidas/99
```

## Entornos

Desarrollo (puerto 3000, con logs de debug):

```bash
npm run dev
```

Produccion (puerto 8080, sin debug):

```bash
npm start
```

En produccion usa http://localhost:8080 en vez de 3000.

Las variables estan en `.env.development` y `.env.production`. No contienen secretos.
