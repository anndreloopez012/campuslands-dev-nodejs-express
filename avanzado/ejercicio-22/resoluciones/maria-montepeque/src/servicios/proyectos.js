// proyectos de arquitectura 3D que se mandan a renderizar a una "granja de render" externa
// la granja nos avisa por webhook cuando empieza, termina o falla

const TRANSICIONES = {
    "render.iniciado": { desde: ["esperando"], a: "renderizando" },
    "render.completado": { desde: ["renderizando"], a: "listo" },
    "render.fallido": { desde: ["esperando", "renderizando"], a: "fallido" }
};

export function crearProyectos() {
    const proyectos = new Map([
        ["casa-lago", { id: "casa-lago", nombre: "Casa del lago", cliente: "Familia Ortiz", estado: "esperando", imagen: null }],
        ["torre-norte", { id: "torre-norte", nombre: "Torre norte", cliente: "Constructora Andes", estado: "esperando", imagen: null }]
    ]);

    // devuelve que paso para que la ruta sepa si debe avisar a los suscriptores
    function aplicarEvento(tipo, datos = {}) {
        const regla = TRANSICIONES[tipo];
        if (!regla) return { aplicado: false, motivo: `evento ${tipo} ignorado` };

        const proyecto = proyectos.get(datos.proyectoId);
        if (!proyecto) return { aplicado: false, motivo: `proyecto ${datos.proyectoId} no existe` };
        // los webhooks pueden llegar desordenados: si no cuadra con el estado, se ignora
        if (!regla.desde.includes(proyecto.estado)) return { aplicado: false, motivo: `no se puede pasar de ${proyecto.estado} a ${regla.a}` };

        proyecto.estado = regla.a;
        if (tipo === "render.completado") proyecto.imagen = datos.url ?? null;
        if (tipo === "render.fallido") proyecto.error = datos.error ?? "sin detalle";
        return { aplicado: true, proyecto: { ...proyecto } };
    }

    return {
        aplicarEvento,
        ver: (id) => (proyectos.has(id) ? { ...proyectos.get(id) } : null),
        listar: () => [...proyectos.values()].map((p) => ({ ...p }))
    };
}
