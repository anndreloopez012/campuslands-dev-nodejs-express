// el servicio usa la cache delante del catalogo (patron "cache-aside"):
//   1. busco en la cache
//   2. si no esta, voy al catalogo y lo guardo en la cache
//   3. cuando algo cambia, borro de la cache lo que quedo viejo

export function crearAutosServicio({ catalogo, cache }) {
    // la clave depende del filtro: ?marca=porsche y ?marca=PORSCHE son lo mismo
    const claveLista = (marca) => `autos:lista:${(marca || "todas").toLowerCase()}`;
    const claveAuto = (id) => `autos:${id}`;

    async function listar({ marca }) {
        return cache.obtener(claveLista(marca), () => catalogo.listar({ marca }), {
            // cualquier cambio de precio afecta las listas
            etiquetas: ["listas"]
        });
    }

    async function buscar(id) {
        return cache.obtener(
            claveAuto(id),
            async () => {
                const auto = await catalogo.buscar(id);
                // si no existe no lo guardo, tiro el error y no se cachea
                if (!auto) throw Object.assign(new Error(`No existe el auto ${id}`), { status: 404 });
                return auto;
            },
            { etiquetas: [`auto:${id}`] }
        );
    }

    async function cambiarPrecio(id, precioUsd) {
        const auto = await catalogo.cambiarPrecio(id, precioUsd);
        if (!auto) throw Object.assign(new Error(`No existe el auto ${id}`), { status: 404 });

        // invalidacion: borro lo que ahora tiene el precio viejo
        cache.invalidarEtiqueta(`auto:${id}`);
        cache.invalidarEtiqueta("listas");
        return auto;
    }

    return { listar, buscar, cambiarPrecio };
}
