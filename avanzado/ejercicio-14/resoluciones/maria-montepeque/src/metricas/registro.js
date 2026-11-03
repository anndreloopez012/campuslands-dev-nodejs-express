// registro de metricas hecho a mano (la idea de prom-client)
//
// tres tipos:
//   contador:   solo sube (peticiones atendidas, libros prestados)
//   medidor:    sube y baja (prestamos activos, memoria)
//   histograma: reparte valores en "baldes" (cuantas peticiones tardaron menos de 50ms, de 100ms...)
//
// cada metrica puede tener etiquetas (metodo, ruta, status) y guarda un valor por combinacion

const clave = (etiquetas) => JSON.stringify(Object.entries(etiquetas).sort());

function validarEtiquetas(nombre, permitidas, etiquetas) {
    const recibidas = Object.keys(etiquetas);
    const raras = recibidas.filter((e) => !permitidas.includes(e));
    if (raras.length > 0) throw new Error(`${nombre} no tiene las etiquetas: ${raras.join(", ")}`);
}

export function crearRegistro() {
    const metricas = new Map();

    function registrar(nombre, metrica) {
        if (!/^[a-z_][a-z0-9_]*$/.test(nombre)) throw new Error(`nombre de metrica invalido: ${nombre}`);
        if (metricas.has(nombre)) throw new Error(`la metrica ${nombre} ya existe`);
        metricas.set(nombre, metrica);
        return metrica;
    }

    function contador(nombre, ayuda, etiquetas = []) {
        const valores = new Map();
        return registrar(nombre, {
            tipo: "counter",
            ayuda,
            inc(etqs = {}, cantidad = 1) {
                if (cantidad < 0) throw new Error("un contador no puede bajar");
                validarEtiquetas(nombre, etiquetas, etqs);
                const k = clave(etqs);
                valores.set(k, { etiquetas: etqs, valor: (valores.get(k)?.valor ?? 0) + cantidad });
            },
            muestras: () => [...valores.values()]
        });
    }

    function medidor(nombre, ayuda, etiquetas = [], { calcular } = {}) {
        const valores = new Map();
        const cambiar = (etqs, fn) => {
            validarEtiquetas(nombre, etiquetas, etqs);
            const k = clave(etqs);
            valores.set(k, { etiquetas: etqs, valor: fn(valores.get(k)?.valor ?? 0) });
        };
        return registrar(nombre, {
            tipo: "gauge",
            ayuda,
            set: (valor, etqs = {}) => cambiar(etqs, () => valor),
            inc: (etqs = {}, n = 1) => cambiar(etqs, (v) => v + n),
            dec: (etqs = {}, n = 1) => cambiar(etqs, (v) => v - n),
            // algunos medidores se calculan al momento de leerlos (ej. memoria)
            muestras: () => (calcular ? calcular() : [...valores.values()])
        });
    }

    function histograma(nombre, ayuda, etiquetas = [], { baldes = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5], ventana = 1000 } = {}) {
        const series = new Map();
        return registrar(nombre, {
            tipo: "histogram",
            ayuda,
            baldes,
            observar(valor, etqs = {}) {
                validarEtiquetas(nombre, etiquetas, etqs);
                const k = clave(etqs);
                if (!series.has(k)) series.set(k, { etiquetas: etqs, cuentas: baldes.map(() => 0), suma: 0, total: 0, recientes: [] });
                const s = series.get(k);

                // cada balde cuenta cuantos valores fueron <= a su limite
                baldes.forEach((limite, i) => {
                    if (valor <= limite) s.cuentas[i]++;
                });
                s.suma += valor;
                s.total++;
                // guardo los ultimos N para calcular percentiles exactos en el JSON
                s.recientes.push(valor);
                if (s.recientes.length > ventana) s.recientes.shift();
            },
            muestras: () => [...series.values()]
        });
    }

    return { contador, medidor, histograma, metricas: () => metricas };
}

// percentil: el valor que deja por debajo al p% de las muestras
export function percentil(valores, p) {
    if (valores.length === 0) return 0;
    const ordenados = [...valores].sort((a, b) => a - b);
    const indice = Math.ceil((p / 100) * ordenados.length) - 1;
    return ordenados[Math.max(0, indice)];
}
