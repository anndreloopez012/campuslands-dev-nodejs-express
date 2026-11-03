# Avanzado 02 - arquitectura escalable

API de una liga de shooters competitivos (jugadores, equipos y torneos)
hecha con Node.js y Express. El foco no es la cantidad de endpoints sino
**como esta organizado el codigo para que pueda crecer**: agregar modulos
sin tocar la app, cambiar donde se guardan los datos sin tocar la logica y
correr varias copias del servidor a la vez.

## Las decisiones

### 1. Modulos por funcionalidad, no por tipo de archivo

En vez de una carpeta `controllers/` con todos los controllers, cada
funcionalidad es un modulo con todo lo suyo:

```text
src/modules/
├── index.js              lista de modulos registrados
├── jugadores/
│   ├── index.js          la "puerta" del modulo
│   ├── jugadores.routes.js
│   ├── jugadores.controller.js
│   └── jugadores.service.js
├── equipos/   (necesita jugadores)
└── torneos/   (necesita equipos)
```

Cuando el proyecto crece, todo lo de "torneos" esta en un solo lugar y un
equipo de trabajo puede encargarse de un modulo sin pisar a otro.

Cada `index.js` describe su modulo:

```js
export const equiposModulo = {
    nombre: "equipos",
    ruta: "/equipos",
    necesita: ["jugadores"],
    datosIniciales: [...],
    crear({ repo, servicios }) { ... return { service, router }; }
};
```

### 2. Un contenedor que arma todo (composition root)

`src/contenedor.js` es el **unico** lugar que decide que repo usa cada
modulo y le pasa los services que necesita:

- Ordena los modulos por dependencias (jugadores -> equipos -> torneos),
  aunque se registren en otro orden.
- A cada modulo le pasa **solo** los services que puso en `necesita`.
- Si hay una dependencia circular (`a -> b -> a`) o falta un modulo, da un
  error claro al arrancar.

`src/app.js` no crea nada: recibe el contenedor y monta el router de cada
modulo en `/api/<ruta>`. Por eso en los tests se le puede pasar un
contenedor distinto.

### 3. Los modulos se hablan por su service, nunca por adentro

Equipos necesita saber si los jugadores existen: llama a
`jugadores.buscarVarios(ids)` y no lee el repo de jugadores ni importa sus
archivos. Asi jugadores puede cambiar como guarda sus datos sin romper a
equipos.

Hay un test que **revisa los imports**: un archivo de un modulo solo puede
importar de su propia carpeta, de `shared/` o paquetes. Si alguien escribe
`import ... from "../jugadores/jugadores.service.js"` dentro de equipos, el
test falla.

### 4. Repositorios intercambiables

Los dos repos tienen la misma interfaz async
(`listar`, `buscar`, `crear`, `actualizar`):

| Repo                                  | Donde guarda                       |
| ------------------------------------- | ---------------------------------- |
| `shared/repositorios/memoria.js`      | En memoria, se pierde al reiniciar |
| `shared/repositorios/archivo-json.js` | Un archivo JSON por modulo en `DATA_DIR` |

Se elige con `REPO=archivo` en el `.env` o `npm run start:archivo`. Ningun
service cambia. Para pasar a una base de datos real se haria un tercer
repo con la misma interfaz.

El de archivo:

- Pone todas las operaciones en una fila, asi 15 peticiones al mismo
  tiempo no se pisan (hay un test con eso).
- Escribe primero a un `.tmp` y despues lo renombra, para que nunca quede
  un archivo a medio escribir.

### 5. La app no guarda estado propio

Para atender mas usuarios se levantan varias copias del servidor detras de
un balanceador. Eso solo funciona si ninguna copia guarda datos "suyos":
todas tienen que leer y escribir en el mismo almacenamiento. Los tests de
`escalar.test.js` crean **dos instancias** de la app con la misma carpeta
de datos y comprueban que lo que crea una lo ve la otra, y que una
instancia nueva (como despues de reiniciar) sigue teniendo todo.

Limite: la fila del repo de archivo cuida las peticiones de **una**
instancia. Dos procesos distintos escribiendo el mismo archivo si se
podrian pisar; para eso de verdad hace falta una base de datos (que
maneja la concurrencia) o un lock entre procesos.

## Como agregar un modulo nuevo

1. Crear `src/modules/<nombre>/` con su routes, controller, service e
   `index.js` (copiar uno existente).
2. Poner en `necesita` los modulos que va a usar.
3. Agregarlo a la lista de `src/modules/index.js`.

No se toca `app.js` ni el contenedor. En `arquitectura.test.js` hay un
ejemplo: un modulo `anuncios` que usa jugadores y funciona solo con
registrarlo.

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script                  | Descripcion                                          |
| ----------------------- | ---------------------------------------------------- |
| `npm start`             | Servidor en http://localhost:4002 con repo en memoria |
| `npm run start:archivo` | Igual pero guardando en `data/*.json`                |
| `npm run dev`           | Servidor con recarga automatica                      |
| `npm test`              | Todos los tests                                      |

Variables (`.env.example`): `PORT`, `REPO` (`memoria` o `archivo`) y
`DATA_DIR`. La carpeta `data/` esta en `.gitignore`.

## Endpoints

| Metodo | Ruta                              | Descripcion                                 |
| ------ | --------------------------------- | ------------------------------------------- |
| GET    | `/health`                         | El servidor vive                            |
| GET    | `/api`                            | Modulos registrados, sus dependencias y el repo |
| GET    | `/api/jugadores`                  | Lista, acepta `?region=`                    |
| POST   | `/api/jugadores`                  | `{ gamertag, region, elo? }`                |
| GET    | `/api/jugadores/:id`              | Un jugador                                  |
| GET    | `/api/equipos`                    | Lista con jugadores y elo promedio          |
| POST   | `/api/equipos`                    | `{ nombre, jugadorIds: [5 ids] }`           |
| GET    | `/api/equipos/:id`                | Un equipo                                   |
| GET    | `/api/torneos`                    | Lista                                       |
| POST   | `/api/torneos`                    | `{ nombre, cupo: 4/8/16, eloMinimo? }`      |
| GET    | `/api/torneos/:id`                | Torneo con equipos y cupos libres           |
| POST   | `/api/torneos/:id/inscripciones`  | `{ equipoId }`                              |

Regiones: `LATAM`, `NA`, `EU`, `ASIA`.

## Ejemplos (PowerShell)

```bash
curl.exe http://localhost:4002/api
```

```json
{
  "ok": true,
  "repo": "memoria",
  "modulos": [
    { "nombre": "jugadores", "ruta": "/api/jugadores", "necesita": [] },
    { "nombre": "equipos", "ruta": "/api/equipos", "necesita": ["jugadores"] },
    { "nombre": "torneos", "ruta": "/api/torneos", "necesita": ["equipos"] }
  ]
}
```

```bash
curl.exe -X POST http://localhost:4002/api/torneos/1/inscripciones -H "Content-Type: application/json" -d '{\"equipoId\":1}'
```

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "nombre": "Copa Centroamerica",
    "cupo": 8,
    "eloMinimo": 1800,
    "equipoIds": [1],
    "cuposLibres": 7,
    "equipos": [{ "id": 1, "nombre": "Quetzal Esports", "eloPromedio": 1990 }]
  }
}
```

## Tests

```text
test/
├── modulos.test.js       los endpoints de cada modulo y como se usan entre ellos
├── escalar.test.js       dos instancias con el mismo almacenamiento, concurrencia, memoria vs archivo
└── arquitectura.test.js  imports entre modulos, contenedor (orden, ciclos, faltantes), modulo nuevo
```

```text
ℹ tests 28
ℹ pass 28
ℹ fail 0
```

Para comprobar que los tests sirven meti dos errores a proposito:

- Quitar la fila del repo de archivo: fallo
  `muchas creaciones al mismo tiempo en una instancia no pierden datos`.
- Importar el service de jugadores dentro de equipos: fallo
  `equipos no importa archivos de otros modulos` con
  `equipos.service.js importa ../jugadores/jugadores.service.js`.

## Casos de error

| Caso                                   | Status | Mensaje                                          |
| -------------------------------------- | ------ | ------------------------------------------------ |
| Body invalido                          | 400    | `Datos invalidos` + lista `errors`               |
| Jugador, equipo o torneo que no existe | 404    | `No existe el equipo con id 9`                   |
| Equipo con jugadores que no existen    | 404    | `No existen los jugadores: 98, 99`               |
| Gamertag repetido                      | 409    | `El gamertag viper ya esta en uso`               |
| Jugador que ya tiene equipo            | 409    | `Algun jugador ya esta en el equipo Quetzal Esports` |
| Equipo ya inscrito o torneo lleno      | 409    | `Quetzal Esports ya esta inscrito`               |
| Elo promedio menor al minimo           | 422    | `Quetzal Esports tiene elo promedio 1990 y el minimo es 2000` |
| Dependencia circular entre modulos     | (no arranca) | `Dependencia circular entre modulos: a -> b -> a` |
