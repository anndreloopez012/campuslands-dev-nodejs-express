export async function buscarPeliculas() {
  await new Promise(resolve => setTimeout(resolve, 1000));

  return [
    {
      id: 1,
      titulo: 'El Conjuro',
      genero: 'Terror'
    },
    {
      id: 2,
      titulo: 'It',
      genero: 'Terror'
    },
    {
      id: 3,
      titulo: 'Siniestro',
      genero: 'Terror'
    }
  ];
}