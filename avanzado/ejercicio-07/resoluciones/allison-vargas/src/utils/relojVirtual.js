export function crearRelojVirtual(inicio = new Date()) {
  let actual = inicio.getTime();
  return {
    reloj: () => new Date(actual),
    avanzar: (ms) => {
      actual += ms;
    },
  };
}
