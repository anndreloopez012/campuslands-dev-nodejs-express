// mide cada peticion: cuantas hubo y cuanto tardaron
//
// importante: la etiqueta "ruta" es el PATRON (/api/libros/:id), no la URL real (/api/libros/7)
// si fuera la URL real habria una serie por cada id -> miles de series (explosion de cardinalidad)
export function middlewareMetricas({ peticiones, duracion, enCurso }) {
    return (req, res, next) => {
        const inicio = process.hrtime.bigint();
        enCurso.inc();

        res.on("finish", () => {
            enCurso.dec();
            const segundos = Number(process.hrtime.bigint() - inicio) / 1e9;

            // req.route solo existe si alguna ruta coincidio
            const ruta = req.route ? req.baseUrl + req.route.path : "no_encontrada";
            const etiquetas = { metodo: req.method, ruta, status: String(res.statusCode) };

            peticiones.inc(etiquetas);
            duracion.observar(segundos, { metodo: req.method, ruta });
        });

        next();
    };
}
