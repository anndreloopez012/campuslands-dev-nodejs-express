# Ejercicio 18 - hash de passwords conceptual

API de un club de paracaidismo hecha con Node.js y Express. Los
paracaidistas se registran y hacen login, pero la password nunca se
guarda: solo se guarda su hash con `bcryptjs`.

## La idea

- Un **hash** es de una sola via: de la password sale el hash, pero del
  hash no se puede sacar la password.
- Para el login no se "descifra" nada. Se vuelve a calcular con la
  password que mandan y se compara (`bcrypt.compare`).
- `sha256` solo no sirve para passwords: la misma password siempre da el
  mismo hash y es muy rapido, entonces se pueden probar millones por
  segundo o usar tablas ya calculadas.
- `bcrypt` arregla eso con dos cosas:
  - **Salt**: un texto aleatorio que se mezcla con la password. La misma
    password da un hash distinto cada vez.
  - **Rondas** (cost): hace el calculo lento a proposito. Con 10 rondas
    son 2^10 vueltas.
- El salt y las rondas van dentro del mismo hash, por eso no hace falta
  guardarlos aparte:

```text
$2b$10$JbAsz3ekds/Mk5Xh51XTjOLMa5hfw5sdcTiZu3x6dLbUM8a8IEw6u
 |   |  |                     |
 |   |  salt (22 caracteres)  hash (31 caracteres)
 |   rondas
 version
```

## Como esta hecho

- `utils/password.js` junta todo lo de passwords: reglas de fuerza,
  `hashPassword` y `compararPassword`.
- En `data/db.js` los usuarios tienen `passwordHash`, nunca `password`.
- `publico()` en el service quita `passwordHash` antes de responder.
- El login responde lo mismo si el email no existe o si la password esta
  mal, asi no se puede adivinar que emails estan registrados.
- Reglas de la password: minimo 8 caracteres, al menos una letra y un
  numero.
- Las rutas `/api/demo/...` son solo para el ejercicio, para ver los
  hashes. En una API real no existirian.

| Carpeta / archivo     | Que hay dentro                                  |
| --------------------- | ----------------------------------------------- |
| `config.js`           | Lee `.env` (puerto y rondas de bcrypt)          |
| `utils/password.js`   | Fuerza, hash y comparacion                      |
| `utils/catch-async.js`| Manda errores de funciones async al middleware  |
| `routes/`             | `index.js` con auth, paracaidistas y demo       |
| `controllers/`        | Auth y demo                                     |
| `services/`           | Registro, login, cambio de password y demo      |
| `data/`               | `db.js` con los paracaidistas en memoria        |

## Variables de entorno

Copia `.env.example` a `.env` si quieres cambiar algo:

```bash
copy .env.example .env
```

| Variable        | Uso                              | Por defecto |
| --------------- | -------------------------------- | ----------- |
| `PORT`          | Puerto del servidor              | `3018`      |
| `BCRYPT_ROUNDS` | Rondas de bcrypt para hashes nuevos | `10`     |

## Usuarios de prueba

| Email            | Password    |
| ---------------- | ----------- |
| `sara@salto.com` | `caida2024` |
| `hugo@salto.com` | `nube12345` |

Se hashean al arrancar el servidor, en el codigo no hay ningun hash
escrito a mano.

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                                        |
| ------------- | -------------------------------------------------- |
| `npm start`   | Levanta el servidor en http://localhost:3018       |
| `npm run dev` | Igual pero con recarga automatica (`node --watch`) |

## Endpoints

| Metodo | Ruta                       | Descripcion                                 |
| ------ | -------------------------- | ------------------------------------------- |
| GET    | `/health`                  | Comprueba que el servidor vive              |
| POST   | `/api/auth/registro`       | Crea una cuenta, guarda solo el hash        |
| POST   | `/api/auth/login`          | Compara la password contra el hash          |
| PATCH  | `/api/auth/password`       | Cambia la password (pide la actual)         |
| GET    | `/api/paracaidistas`       | Lista sin `passwordHash`                    |
| GET    | `/api/demo/hash?texto=...` | Compara sha256 contra bcrypt con el mismo texto |
| GET    | `/api/demo/base-de-datos`  | Muestra lo que de verdad se guarda          |

Bodies:

- Registro: `nombre`, `email`, `password` y `licencia` opcional (`A`, `B`,
  `C` o `D`).
- Login: `email` y `password`.
- Cambio de password: `email`, `actual` y `nueva`.

## Ejemplos (PowerShell)

Registro:

```bash
curl.exe -X POST http://localhost:3018/api/auth/registro -H "Content-Type: application/json" -d '{\"nombre\":\"Nina Altura\",\"email\":\"nina@salto.com\",\"password\":\"salto4000\",\"licencia\":\"C\"}'
```

```json
{ "ok": true, "data": { "id": 3, "nombre": "Nina Altura", "email": "nina@salto.com", "licencia": "C", "saltos": 0 } }
```

Login:

```bash
curl.exe -X POST http://localhost:3018/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"nina@salto.com\",\"password\":\"salto4000\"}'
```

Mismo texto, dos veces:

```bash
curl.exe "http://localhost:3018/api/demo/hash?texto=caida2024"
```

```json
{
  "ok": true,
  "data": {
    "texto": "caida2024",
    "sha256": {
      "intento1": "a0a470bf66754e63cb6dcc17787d28e06d2cb160b24ce2f644d16f412838a7f0",
      "intento2": "a0a470bf66754e63cb6dcc17787d28e06d2cb160b24ce2f644d16f412838a7f0",
      "iguales": true
    },
    "bcrypt": {
      "intento1": "$2b$10$JbAsz3ekds/Mk5Xh51XTjOLMa5hfw5sdcTiZu3x6dLbUM8a8IEw6u",
      "intento2": "$2b$10$4k1.uWL66tKrMIYaiD2WJeeN4iwjSY3Bu98D6uydF4JpV0uexpggG",
      "iguales": false,
      "partes": { "version": "$2b$", "rondas": 10, "salt": "JbAsz3ekds/Mk5Xh51XTjO", "hash": "LMa5hfw5sdcTiZu3x6dLbUM8a8IEw6u" },
      "losDosValidan": true
    }
  }
}
```

Los dos hashes de bcrypt son distintos, pero los dos validan la misma
password.

## Casos de error

| Caso                                   | Status | Mensaje                                           |
| -------------------------------------- | ------ | ------------------------------------------------- |
| Password incorrecta o email que no existe | 401 | `Credenciales incorrectas`                        |
| Password debil al registrar o cambiar  | 400    | `La password no es segura` + lista `errors`       |
| Registro con datos malos               | 400    | `Datos invalidos` + lista `errors`                |
| Email ya registrado                    | 409    | `Ya existe una cuenta con ese email`              |
| Cambio con la password actual mal      | 401    | `Credenciales incorrectas`                        |
| Nueva password igual a la actual       | 400    | `La nueva password tiene que ser distinta a la actual` |
| Demo sin `texto`                       | 400    | `Manda ?texto= con 1 a 72 caracteres`             |

Password debil:

```bash
curl.exe -X POST http://localhost:3018/api/auth/registro -H "Content-Type: application/json" -d '{\"nombre\":\"Leo\",\"email\":\"leo@salto.com\",\"password\":\"abc\"}'
```

```json
{
  "ok": false,
  "message": "La password no es segura",
  "errors": ["password debe tener al menos 8 caracteres", "password debe tener al menos un numero"]
}
```

## Notas

- El limite de 72 caracteres de la demo es porque bcrypt solo usa los
  primeros 72 bytes de la password.
- Los datos viven en memoria, al reiniciar el servidor se pierden las
  cuentas nuevas.
