// repositorio en memoria
// las funciones son async para que se parezcan a una base de datos de verdad
function crearRepositorioEnMemoria(iniciales = []) {
    const compuestos = iniciales.map((c) => ({ ...c }));
    let nextId = compuestos.length + 1;

    return {
        async listar() {
            return compuestos.map((c) => ({ ...c }));
        },

        async buscarPorFormula(formula) {
            const encontrado = compuestos.find((c) => c.formula === formula);
            return encontrado ? { ...encontrado } : null;
        },

        async guardar(datos) {
            const nuevo = { id: nextId++, ...datos };
            compuestos.push(nuevo);
            return { ...nuevo };
        }
    };
}

export { crearRepositorioEnMemoria };
