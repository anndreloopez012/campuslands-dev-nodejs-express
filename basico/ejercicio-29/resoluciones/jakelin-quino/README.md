# Ejercicio 29 - README tecnico

API de equipos de futbol y futbol sala. Este README documenta instalacion, configuracion, rutas, ejemplos y respuestas de error para que otra persona pueda probar el proyecto.

## Requisitos

- Node.js 20 o superior.
- npm.

## Instalacion y ejecucion

```bash
npm install
npm start
```

El servidor escucha en `http://localhost:3029`. Para elegir otro puerto, define la variable de entorno `PORT` antes de iniciar.

## Rutas

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/teams` | Lista equipos; acepta el filtro opcional `?sport=soccer` o `?sport=futsal`. |
| GET | `/teams/:id` | Consulta un equipo por id. |

## Ejemplos

```bash
curl http://localhost:3029/teams
curl "http://localhost:3029/teams?sport=futsal"
curl http://localhost:3029/teams/1
```

Una consulta exitosa devuelve `200` y un objeto JSON con `ok` y `data`. Un id mal formado devuelve `400`; un equipo que no existe devuelve `404`.