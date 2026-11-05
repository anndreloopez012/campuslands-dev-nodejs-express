# Avanzado 18 - Multirol avanzado (paracaidismo)

API en Node.js y Express para una zona de paracaidismo: alumnos, paracaidistas con licencia, instructores, pilotos, jefatura y administracion. El tema es la **autorizacion con varios roles**: herencia de roles, usuarios con mas de un rol, permisos que dependen de atributos (licencia, certificacion, alumno asignado, piloto asignado), prohibiciones que ganan siempre y un endpoint que explica por que se permitio o nego algo.

## Como ejecutarlo

```bash
npm install
npm start          # puerto 3000, cambia con PORT=3100
npm test
```

Ruta base: `/avanzado/ejercicio-18`. La autenticacion no es el tema de este ejercicio (ver el 17), asi que cada usuario tiene un token fijo en `src/data/usuarios.json`: `Authorization: Bearer tk-sofia`, `tk-camila`, `tk-martin`, `tk-rosa`, `tk-elena`, etc.

## Probar rapido

```bash
BASE=http://localhost:3000/avanzado/ejercicio-18
curl -H "Authorization: Bearer tk-martin" $BASE/yo
curl -H "Authorization: Bearer tk-sofia" -H "Content-Type: application/json" -d '{"vueloId":1,"tipo":"libre"}' $BASE/saltos
curl -H "Authorization: Bearer tk-elena" -H "Content-Type: application/json" \
  -d '{"accion":"saltos:aprobar","saltoId":1}' $BASE/autorizacion/explicar
```

## Roles y herencia (`src/autorizacion/politicas.js`)

```
alumno        perfil:ver, saltos:ver, saltos:crear
paracaidista  hereda alumno       + equipos:reservar
instructor    hereda paracaidista + saltos:aprobar, bitacora:firmar
piloto        perfil:ver, vuelos:ver, vuelos:despegar, manifiesto:ver
jefe_zona     hereda instructor   + vuelos:crear, manifiesto:ver, saltos:ver_todos, clima:gestionar
admin         hereda jefe_zona    + roles:ver
```

- Un usuario puede tener varios roles (Martin es `piloto` y `paracaidista`); sus permisos son la union.
- Al arrancar se valida la definicion: un rol que hereda de uno inexistente, una herencia circular (`a -> b -> c -> a`) o un permiso mal escrito detienen el inicio.

## Como se decide (`src/autorizacion/motor.js`)

Cada decision pasa por tres etapas, en este orden:

1. **Prohibiciones**: reglas que niegan aunque algun rol permita. Ejemplos: con el clima suspendido nadie crea, aprueba ni despega; una cuenta suspendida no salta.
2. **Rol**: algun rol del usuario (propio o heredado) debe otorgar el permiso.
3. **Condiciones** sobre atributos del usuario, del recurso y del contexto:

| Permiso | Condicion |
| --- | --- |
| `saltos:crear` | `libre` exige licencia A+, `wingsuit` licencia C+. Con licencia ya no corresponde `aff` |
| `saltos:aprobar` | Exige certificacion de instructor. **Nadie aprueba su propio salto** (separacion de funciones). El salto de un alumno solo lo aprueba su instructor asignado |
| `saltos:ver` | Los propios, los de tus alumnos, o todos con `saltos:ver_todos` |
| `vuelos:despegar` | Solo el piloto asignado a ese vuelo |
| `manifiesto:ver` | El piloto asignado o quien puede crear vuelos |

Por eso **un rol no alcanza**: el admin hereda `saltos:aprobar` a traves de `jefe_zona -> instructor`, pero no tiene la certificacion, y la decision lo niega en la etapa de condicion.

Cada decision devuelve `{ permitido, etapa, motivo, otorgadoPor }`. Un `403` incluye la accion y el motivo en `contexto`.

### Filtrar en vez de prohibir

`GET /saltos` no responde 403: devuelve solo los saltos que el usuario puede ver. Y `GET /saltos/:id` de un salto ajeno responde **404**, no 403, para no confirmar que existe.

## Rutas (todas requieren token salvo `GET /`)

| Metodo y ruta | Que hace |
| --- | --- |
| `GET /` | Informacion del ejercicio |
| `GET /yo` | Roles, roles efectivos con herencia, permisos, licencia y certificaciones |
| `POST /autorizacion/explicar` | `{ accion, saltoId?, vueloId?, tipo? }` explica la decision para el usuario actual |
| `GET /roles` | Definicion de roles (solo `roles:ver`) |
| `GET /saltos` | Saltos visibles para el usuario |
| `POST /saltos` | `{ vueloId, tipo: tandem|aff|libre|wingsuit }` se anota en un vuelo |
| `GET /saltos/:id` | Detalle (404 si no lo puede ver) |
| `POST /saltos/:id/resolucion` | `{ decision: aprobar|rechazar, nota? }` |
| `GET /vuelos` | Vuelos con ocupacion |
| `POST /vuelos` | `{ avion, pilotoId, hora, capacidad }` (jefatura). El piloto debe tener rol piloto |
| `GET /vuelos/:id/manifiesto` | Lista de saltadores |
| `POST /vuelos/:id/despegue` | Solo el piloto asignado, sin saltos pendientes |
| `GET /clima`, `PUT /clima` | `{ suspendido, motivo }` (jefatura) |

## Errores

| Codigo | Estado | Cuando |
| --- | --- | --- |
| `VALIDACION` | 400 | Datos invalidos |
| `JSON_INVALIDO` | 400 | Body que no es JSON |
| `NO_AUTENTICADO` | 401 | Falta el token o no existe |
| `PROHIBIDO` | 403 | La decision fue negativa (con `contexto.motivo`) |
| `SALTO_NO_ENCONTRADO`, `VUELO_NO_ENCONTRADO` | 404 | No existe o no se puede ver |
| `RUTA_NO_ENCONTRADA` | 404 | Ruta desconocida |
| `METODO_NO_PERMITIDO` | 405 | Metodo no admitido |
| `VUELO_LLENO` | 409 | Sin cupo |
| `VUELO_NO_DISPONIBLE` | 409 | El vuelo ya salio |
| `VUELO_CON_PENDIENTES` | 409 | Hay saltos sin aprobar al despegar |
| `SALTO_YA_RESUELTO` | 409 | Ya fue aprobado o rechazado |
| `SALTO_DUPLICADO` | 409 | Ya estas anotado en ese vuelo |
| `PAYLOAD_GRANDE` | 413 | Body muy grande |
| `FORMATO_NO_SOPORTADO` | 415 | Falta `Content-Type: application/json` |
| `ERROR_INTERNO` | 500 | Error inesperado |

## Estructura

```
src/
  app.js, server.js
  autorizacion/  motor (herencia, etapas y decisiones), politicas (roles, condiciones y prohibiciones)
  services/      zona (saltos, vuelos, clima)
  routes/        zona
  validators/    validaciones escritas a mano
  middlewares/   errores, notFound, metodoNoPermitido, exigirTipo
  errores/       catalogo de errores
test/            motor de autorizacion y pruebas de API por usuario
```
