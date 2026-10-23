const proyectos = [
  { id: 1, nombre: 'Casa moderna', tipo: 'residencial', pisos: 2 },
  { id: 2, nombre: 'Torre de oficinas', tipo: 'comercial', pisos: 15 },
  { id: 3, nombre: 'Museo digital', tipo: 'cultural', pisos: 3 }
];

export function getProyectos() {
  return proyectos;
}

export function buscarProyecto(id) {
  return proyectos.find((p) => p.id === id);
}
