// leer y escribir la cookie del refresh sin librerias

export function leerCookies(req) {
    const cookies = {};
    for (const parte of (req.get("Cookie") || "").split(";")) {
        const i = parte.indexOf("=");
        if (i > 0) cookies[parte.slice(0, i).trim()] = decodeURIComponent(parte.slice(i + 1).trim());
    }
    return cookies;
}

// el refresh va en una cookie:
//   HttpOnly: JavaScript del navegador NO la puede leer (si hay XSS no la roba)
//   SameSite=Strict: no se manda desde otros sitios (protege de CSRF)
//   Path=/api/auth: solo viaja a las rutas de auth, no en cada peticion
//   Secure: solo por HTTPS (en local no, porque no hay HTTPS)
export function cookieRefresh(token, { segundos, segura }) {
    const partes = [`refresh=${encodeURIComponent(token)}`, "HttpOnly", "SameSite=Strict", "Path=/api/auth", `Max-Age=${segundos}`];
    if (segura) partes.push("Secure");
    return partes.join("; ");
}

export const borrarCookieRefresh = () => "refresh=; HttpOnly; SameSite=Strict; Path=/api/auth; Max-Age=0";
