const saltos = [
  { id: 1, saltador: 'Carlos Mendez', altura: 4000, tipo: 'tandem' },
  { id: 2, saltador: 'Laura Perez', altura: 3500, tipo: 'solo' }
];

export function getSaltos() {
  return saltos;
}

export function agregarSalto(saltador, altura, tipo) {
  const nuevo = {
    id: saltos.length + 1,
    saltador: saltador,
    altura: altura,
    tipo: tipo
  };

  saltos.push(nuevo);
  return nuevo;
}
