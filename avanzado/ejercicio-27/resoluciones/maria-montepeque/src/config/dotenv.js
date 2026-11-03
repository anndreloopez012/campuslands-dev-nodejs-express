// lector de archivos .env hecho a mano (sin la libreria dotenv)
// soporta:  CLAVE=valor   # comentarios   CLAVE="con espacios"   CLAVE='literal'   export CLAVE=x

export function parsearEnv(texto) {
    const resultado = {};
    const lineas = texto.replace(/^﻿/, "").split(/\r?\n/);
    lineas.forEach((original, i) => {
        const linea = original.trim();
        if (linea === "" || linea.startsWith("#")) return;

        const m = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(linea);
        if (!m) throw new Error(`.env linea ${i + 1}: no entiendo "${linea}"`);
        let [, clave, valor] = m;

        if (valor.startsWith('"')) {
            const fin = valor.indexOf('"', 1);
            if (fin === -1) throw new Error(`.env linea ${i + 1}: falta cerrar la comilla`);
            // entre comillas dobles \n es salto de linea
            valor = valor.slice(1, fin).replaceAll("\\n", "\n");
        } else if (valor.startsWith("'")) {
            const fin = valor.indexOf("'", 1);
            if (fin === -1) throw new Error(`.env linea ${i + 1}: falta cerrar la comilla`);
            valor = valor.slice(1, fin);
        } else {
            // sin comillas, lo que va despues de " #" es comentario
            valor = valor.replace(/\s+#.*$/, "").trim();
        }
        resultado[clave] = valor;
    });
    return resultado;
}
