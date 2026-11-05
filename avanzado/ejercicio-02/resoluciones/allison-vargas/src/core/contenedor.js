export function crearContenedor() {
  const fabricas = new Map();
  const instancias = new Map();
  const resolviendo = [];

  const contenedor = {
    registrar(nombre, fabrica) {
      if (fabricas.has(nombre)) throw new Error(`La dependencia ${nombre} ya esta registrada`);
      if (typeof fabrica !== 'function') throw new Error(`La dependencia ${nombre} necesita una funcion fabrica`);
      fabricas.set(nombre, fabrica);
    },

    reemplazar(nombre, fabrica) {
      if (!fabricas.has(nombre)) throw new Error(`No se puede reemplazar ${nombre}: no esta registrada`);
      if (instancias.has(nombre)) throw new Error(`No se puede reemplazar ${nombre}: ya fue resuelta`);
      fabricas.set(nombre, fabrica);
    },

    tiene(nombre) {
      return fabricas.has(nombre);
    },

    nombres() {
      return [...fabricas.keys()];
    },

    resolver(nombre) {
      if (instancias.has(nombre)) return instancias.get(nombre);
      if (!fabricas.has(nombre)) throw new Error(`Dependencia no registrada: ${nombre}`);
      if (resolviendo.includes(nombre)) {
        throw new Error(`Dependencia circular: ${[...resolviendo, nombre].join(' -> ')}`);
      }
      resolviendo.push(nombre);
      try {
        const instancia = fabricas.get(nombre)(contenedor);
        instancias.set(nombre, instancia);
        return instancia;
      } finally {
        resolviendo.pop();
      }
    },
  };

  return contenedor;
}
