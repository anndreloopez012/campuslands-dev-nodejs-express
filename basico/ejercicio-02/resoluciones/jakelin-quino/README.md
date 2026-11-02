# Ejercicio 02 - npm scripts y package.json

Practica de scripts npm usando solo Node.JS.

## Uso

Ubicarse en:
```bash
basico/ejercicio-02/resoluciones/jakelin-quino/
```

El proyecto usa scripts de `package.json` para ejecutar un perfil de jugador de un shooter competitivo. Probar:
```bash
npm start
```
Resultado:
```json
{
	"mensaje": "Usa npm start o npm run perfil para ejecutar el programa"
}
```

Para ejecutar el comando del perfil:
```bash
npm run perfil
```
Resultado:
```json
{
	"juego": "Arena Strike",
	"jugador": "Nova",
	"rango": "Oro",
	"mensaje": "Perfil competitivo cargado"
}
```

Tambien se puede ejecutar el modo de desarrollo con:
```bash
npm run dev
```