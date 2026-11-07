# INTERMEDIO 11 - Busqueda textual

## Objetivo

Crear una API Node.js con Express que implemente busqueda textual en memoria sobre una coleccion de pistas de musica, con busqueda por multiples campos, insensible a acentos y mayusculas, y resultados ordenados por relevancia.

## Concepto principal

La busqueda textual tiene tres piezas:

1. **Normalizacion**: `normalizar()` pasa a minusculas, elimina acentos con `normalize('NFD')` + registro de marcas diacriticas, y colapsa espacios. Asi "café" encuentra "Cafe".
2. **Busqueda muliterrada**: dividir la consulta en terminos; una pista nunca se considera una coincidencia si no contiene **todos** los terminos en el mismo campo (busqueda `AND`).
3. **Puntaje de relevancia**: si una consulta coincide en mas de un campo (por ejemplo en titulo y album), la coincidencia sube en el listado. En desempate, gana menor id.

Ademas se puede restringir la busqueda a un solo campo (`campo=`) y limitar resultados con `limite=`.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── routes/
    │   └── tracks.routes.js
    ├── controllers/
    │   └── tracks.controller.js
    └── services/
        └── tracks.service.js
```

## Como ejecutar

```bash
npm install
npm run start   # produccion
npm run dev     # desarrollo con recarga automatica
```

## Endpoints

| Metodo | Ruta | Descripcion | Codigo |
| ------ | ---- | ----------- | ------ |
| GET | /health | Verifica el estado del servidor | 200 |
| GET | /tracks | Busqueda textual | 200 / 400 |

## Ejemplos de peticiones

```bash
# Busqueda multi-campo: la pista puede coincidir en titulo, artista o album
curl "http://localhost:3000/tracks?q=tie%20val"

# Insensible a acentos: q=Maquina%20Antigua encuentra "Máquina Antigua" (normalizado)
curl "http://localhost:3000/tracks?q=maquina"

# Restringir a un campo
curl "http://localhost:3000/tracks?q=blue&campo=album"

# Limitar resultados
curl "http://localhost:3000/tracks?q=late&limite=2"

# Caso de error: q obligatoria -> 400
curl "http://localhost:3000/tracks"

# Caso de error: campo no buscable -> 400
curl "http://localhost:3000/tracks?q=algo&campo=duracion"
```

## Punto clave

Si quisieras usar motores realistas (`Meilisearch`, `Algolia`, `PostgreSQL tsvector`), la interfaz del servicio (`buscarPistas(query, opciones)`) te deja claro el swap de motor sin cambios en el controlador — lo que hace aqui el servicio es la base conceptual.
