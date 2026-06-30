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
src/
├── app.js
├── server.js
├── routes/
├── controllers/
├── services/
└── data/
```

## Checklist

- [ ] Endpoint principal funcionando.
- [ ] Validacion de entrada cuando aplique.
- [ ] Manejo de error basico.
- [ ] README de entrega con instrucciones.
- [ ] PR hacia dev.
