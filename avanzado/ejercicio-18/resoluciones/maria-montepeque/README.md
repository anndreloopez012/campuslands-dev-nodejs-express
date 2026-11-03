# Avanzado 18 - multirol avanzado

API de un club de paracaidismo (saltos, aprobaciones y equipo) hecha con
Node.js y Express. Los usuarios pueden tener **varios roles**, los roles
**heredan** de otros, los permisos tienen **alcance** (solo lo mio, lo de
mis alumnos, todo) y hay **negaciones** que ganan sobre cualquier rol.

En el intermedio 17 los permisos eran "este rol puede X". Aqui la
pregunta es mas fina: "**este usuario** puede hacer X **sobre este
recurso**?".

## Roles (`src/permisos/roles.js`)

```text
          jefe_dz (4)
          /       \
  instructor (3)  rigger (2)
       |
   alumno (1)
```

| Rol         | Permisos propios                                     |
| ----------- | ---------------------------------------------------- |
| alumno      | `saltos:ver:propio`, `saltos:crear:propio`, `equipo:ver:todos` |
| rigger      | `equipo:ver:todos`, `equipo:inspeccionar:todos`      |
| instructor  | hereda alumno + `saltos:ver:mis_alumnos`, `saltos:aprobar:mis_alumnos` |
| jefe_dz     | hereda instructor y rigger + `saltos:*:todos`, `equipo:*:todos`, `usuarios:asignar_rol:todos` |

Formato: `recurso:accion:alcance`, con `*` como comodin.

## El motor (`src/permisos/motor.js`)

`puede(usuario, "saltos:aprobar", { duenoId })` decide en este orden:

1. **Negaciones del usuario** (ej. Hugo tiene `saltos:crear` negado por
   una restriccion medica). Si una coincide, **no**, aunque algun rol lo
   permita.
2. **Roles efectivos:** los asignados (menos los **vencidos**: un rol
   puede tener `venceEn`) mas todos los que heredan.
3. **Permisos que coinciden** con `recurso:accion` (con comodines).
4. **Alcance** contra el recurso concreto:
   - `propio`: el recurso es del usuario.
   - `mis_alumnos`: el dueno esta en la lista de alumnos del usuario.
   - `todos`: cualquiera.
5. Si nada coincide, **no**.

Siempre devuelve el **motivo** (`permitido por saltos:aprobar:mis_alumnos`,
`negado: restriccion medica`, `tiene ... pero el recurso no esta en su
alcance`). Con eso:

- El 403 dice por que.
- `GET /api/permisos/explicar` responde "puedo o no, y por que" sin
  intentar la accion (util para soporte y para que la interfaz muestre u
  oculte botones).
- `GET /api/saltos` filtra la lista con el mismo motor: cada uno ve solo
  lo de su alcance.

### Reglas extra

- **Nadie aprueba su propio salto**, ni la jefa (conflicto de interes):
  es una regla del negocio que va ademas del permiso.
- **No escalar privilegios:** al dar un rol se revisa que no sea de
  **nivel mas alto** que el del que lo da.
- Un rol vencido tampoco aporta lo que heredaba (Tomas fue instructor
  temporal: aunque sigue teniendo alumnos asignados, ya no aprueba).

### Autenticacion simulada

El usuario se elige con el header `X-Usuario-Id` porque el tema es la
**autorizacion**. En una app real saldria del JWT (avanzado 17).

## Usuarios de prueba

| Id | Quien                                           |
| -- | ----------------------------------------------- |
| 1  | Sara, alumna                                    |
| 2  | Hugo, alumno con restriccion medica             |
| 3  | Ines, instructora de Sara y Hugo                |
| 4  | Rafa, instructor sin alumnos y rigger           |
| 5  | Diana, jefa de la zona de salto                 |
| 6  | Tomas, alumno con rol de instructor vencido     |

## Requisitos e instalacion

Node.js 20 o superior. Sin base de datos.

```bash
npm install
npm start
```

| Script        | Descripcion                        |
| ------------- | ---------------------------------- |
| `npm start`   | Servidor en http://localhost:4018  |
| `npm run dev` | Servidor con recarga automatica    |
| `npm test`    | Tests del motor y de la API        |

## Endpoints (todos con `X-Usuario-Id`)

| Metodo | Ruta                              | Permiso                          |
| ------ | --------------------------------- | -------------------------------- |
| GET    | `/api/yo`                         | Roles asignados, efectivos y permisos |
| GET    | `/api/permisos/explicar`          | `?accion=saltos:aprobar&saltoId=1` |
| GET    | `/api/saltos`                     | Filtrado por `saltos:ver`        |
| GET    | `/api/saltos/:id`                 | `saltos:ver`                     |
| POST   | `/api/saltos`                     | `saltos:crear` (`{ altitud, fecha }`) |
| POST   | `/api/saltos/:id/aprobar`         | `saltos:aprobar`                 |
| POST   | `/api/equipo/:id/inspeccionar`    | `equipo:inspeccionar`            |
| POST   | `/api/usuarios/:id/roles`         | `usuarios:asignar_rol` (`{ rol, venceEn? }`) |

## Ejemplo (PowerShell)

```bash
curl.exe http://localhost:4018/api/permisos/explicar?accion=saltos:aprobar"&"saltoId=3 -H "X-Usuario-Id: 3"
```

```json
{ "ok": true, "data": { "usuario": "Ines (instructora de Sara y Hugo)", "accion": "saltos:aprobar", "permitido": false, "motivo": "tiene saltos:aprobar:mis_alumnos pero el recurso no esta en su alcance" } }
```

```bash
curl.exe -X POST http://localhost:4018/api/saltos -H "X-Usuario-Id: 2" -H "Content-Type: application/json" -d '{\"altitud\":4000,\"fecha\":\"2026-11-01\"}'
```

```json
{ "ok": false, "message": "No puedes saltos:crear", "motivo": "negado: restriccion medica hasta nuevo examen" }
```

## Tests

- `test/motor.test.js`: herencia, suma de roles, rol vencido, alcance
  propio y mis_alumnos, comodin, negacion que gana, motivos.
- `test/api.test.js`: lista filtrada por usuario, 403 con motivo,
  aprobar (suyos si, ajenos no, vencido no, propio no, dos veces 409),
  negacion de Hugo, multirol de Rafa, asignar roles temporales, explicar,
  `/api/yo`, 401.

```text
ℹ tests 24
ℹ pass 24
ℹ fail 0
```

Para comprobar que sirven hice que no se revisaran las negaciones y
fallaron 2 tests (Hugo podia registrar saltos con la restriccion medica).
