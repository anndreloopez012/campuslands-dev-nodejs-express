# Plantilla de entrega Node.js/Express

## Comandos sugeridos

```bash
npm install
npm run dev
```

## package.json sugerido

```json
{
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "latest"
  }
}
```

## Estructura sugerida

```text
basico/ejercicio-01/resoluciones/nombre-apellido/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── controllers/
    │   └── status.controller.js
    ├── routes/
    │   └── status.routes.js
    ├── services/
    │   └── status.service.js
    └── data/
```

## Checklist

- [ x ] Endpoint principal funcionando.
- [ x ] Validacion de entrada cuando aplique.
- [ x ] Manejo de error basico.
- [ x ] README de entrega con instrucciones.
- [ ] PR hacia dev.
