# Ejercicio 026: Mock de Dependencias

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** Mock de Dependencias (shooters competitivos)

## Estructura de Carpetas

```text
intermedio/ejercicio-26/resoluciones/antonio-canux/
├── README.md
├── package.json
├── src/app.js
├── src/controllers/weapons.controller.js
├── src/data/weapons.data.js
├── src/repositories/weapons.repository.js
├── src/routes/weapons.routes.js
├── src/server.js
├── src/services/weapons.service.js
└── test/weapons.service.test.js
```

## Cómo funciona

- El servicio recibe su repositorio por parámetro (inyección de dependencias).
- Las pruebas lo reemplazan con `mock.fn()` de `node:test` y verifican llamadas y resultados sin tocar los datos reales. Se ejecutan con `npm test`.

## Ejecución

```bash
npm install
npm run dev
```

```bash
npm test
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-26

# Arma más fuerte
curl http://localhost:3000/api/weapons/strongest

# DPS de un arma
curl http://localhost:3000/api/weapons/1/dps

# Arma inexistente (404)
curl http://localhost:3000/api/weapons/99/dps
```
