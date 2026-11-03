// simula la "fuente lenta": una base de datos o una API de precios que tarda
// cuenta cuantas veces la llamaron, asi se ve cuanto ahorra la cache

const AUTOS = [
    { id: 1, marca: "Ferrari", modelo: "Roma", anio: 2024, hp: 612, precioUsd: 247_000 },
    { id: 2, marca: "Lamborghini", modelo: "Huracan EVO", anio: 2023, hp: 631, precioUsd: 268_000 },
    { id: 3, marca: "Porsche", modelo: "911 Turbo S", anio: 2024, hp: 640, precioUsd: 230_000 },
    { id: 4, marca: "Bentley", modelo: "Continental GT", anio: 2023, hp: 650, precioUsd: 235_000 },
    { id: 5, marca: "Rolls-Royce", modelo: "Ghost", anio: 2024, hp: 563, precioUsd: 343_000 },
    { id: 6, marca: "Aston Martin", modelo: "DB12", anio: 2024, hp: 671, precioUsd: 245_000 },
    { id: 7, marca: "Porsche", modelo: "Taycan Turbo", anio: 2023, hp: 670, precioUsd: 185_000 }
];

export function crearCatalogo({ demoraMs = 300 } = {}) {
    const autos = structuredClone(AUTOS);
    const llamadas = { listar: 0, buscar: 0 };
    const esperar = () => new Promise((r) => setTimeout(r, demoraMs));

    return {
        async listar({ marca } = {}) {
            llamadas.listar++;
            await esperar();
            return autos.filter((a) => !marca || a.marca.toLowerCase() === marca.toLowerCase()).map((a) => ({ ...a }));
        },
        async buscar(id) {
            llamadas.buscar++;
            await esperar();
            const auto = autos.find((a) => a.id === id);
            return auto ? { ...auto } : null;
        },
        // escribir no se cachea, va directo
        async cambiarPrecio(id, precioUsd) {
            const auto = autos.find((a) => a.id === id);
            if (!auto) return null;
            auto.precioUsd = precioUsd;
            return { ...auto };
        },
        llamadas: () => ({ ...llamadas })
    };
}
