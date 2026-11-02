const artists = [
  { id: 1, name: 'Sofia Marroquin', studio: 'tinta-viva', styles: ['realismo', 'blackwork'], hourlyRate: 60 },
  { id: 2, name: 'Andres Coti', studio: 'tinta-viva', styles: ['tradicional', 'neotradicional'], hourlyRate: 45 },
  { id: 3, name: 'Valeria Ixcoy', studio: 'aguja-fina', styles: ['minimalista', 'linea fina'], hourlyRate: 50 },
  { id: 4, name: 'Mateo Rojas', studio: 'aguja-fina', styles: ['realismo', 'acuarela'], hourlyRate: 75 },
];

const works = [
  { id: 1, artistId: 1, title: 'Lobo en blanco y negro', style: 'blackwork', hours: 6 },
  { id: 2, artistId: 1, title: 'Retrato de abuela', style: 'realismo', hours: 9 },
  { id: 3, artistId: 2, title: 'Ancla clasica', style: 'tradicional', hours: 2 },
  { id: 4, artistId: 2, title: 'Pantera neotradicional', style: 'neotradicional', hours: 5 },
  { id: 5, artistId: 3, title: 'Luna minimalista', style: 'minimalista', hours: 1 },
  { id: 6, artistId: 4, title: 'Colibri en acuarela', style: 'acuarela', hours: 4 },
];

module.exports = { artists, works };
