// marca una version como vieja con los headers que usan las APIs reales
//   Deprecation: true                       -> esta version esta deprecada
//   Sunset: <fecha>                         -> el dia que se apaga
//   Link: </api/v2/...>; rel="successor-version" -> a donde migrar
export function marcarDeprecada({ sunset, sucesora }) {
    const fechaSunset = new Date(sunset).toUTCString();

    return function (req, res, next) {
        res.set("Deprecation", "true");
        res.set("Sunset", fechaSunset);
        // misma ruta pero en la version nueva
        const ruta = req.originalUrl.replace(/^\/api\/v\d+/, sucesora);
        res.set("Link", `<${ruta}>; rel="successor-version"`);
        next();
    };
}

// header simple para saber que version respondio
export function versionHeader(version) {
    return function (req, res, next) {
        res.set("API-Version", version);
        next();
    };
}
