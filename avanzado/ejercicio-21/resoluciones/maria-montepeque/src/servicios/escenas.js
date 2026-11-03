// escenas 3D con control de version (bloqueo optimista)
// dos animadores editan la misma escena: el que llega con una version vieja recibe 412
// asi nadie borra sin querer el trabajo del otro

export class ErrorEscena extends Error {
    constructor(status, mensaje, extra = {}) {
        super(mensaje);
        this.status = status;
        this.extra = extra;
    }
}

const CAMPOS_EDITABLES = ["nombre", "camara", "iluminacion", "frames"];

export function crearEscenas() {
    const escenas = new Map([
        [1, { id: 1, nombre: "Robot caminando", camara: "orbital", iluminacion: "tres puntos", frames: 48, version: 1 }],
        [2, { id: 2, nombre: "Ciudad de noche", camara: "dron", iluminacion: "hdri", frames: 120, version: 1 }]
    ]);

    function ver(id) {
        const escena = escenas.get(id);
        if (!escena) throw new ErrorEscena(404, `No existe la escena ${id}`);
        return escena;
    }

    function actualizar(id, cambios = {}, versionEsperada) {
        const escena = ver(id);
        if (versionEsperada === undefined) throw new ErrorEscena(428, "Manda If-Match con la version que editaste (ej. If-Match: \"1\")");
        if (versionEsperada !== escena.version) {
            throw new ErrorEscena(412, `Alguien mas edito la escena: tu tienes la version ${versionEsperada} y la actual es ${escena.version}`, { versionActual: escena.version });
        }

        const errores = [];
        for (const campo of Object.keys(cambios)) if (!CAMPOS_EDITABLES.includes(campo)) errores.push(`${campo} no se puede editar`);
        if (cambios.frames !== undefined && (!Number.isInteger(cambios.frames) || cambios.frames < 1 || cambios.frames > 1000)) errores.push("frames debe ser de 1 a 1000");
        if (errores.length > 0) throw new ErrorEscena(400, "Datos invalidos", { errors: errores });

        Object.assign(escena, cambios);
        escena.version++;
        return { ...escena };
    }

    return { ver: (id) => ({ ...ver(id) }), actualizar };
}
