// Servicio refactorizado: Toda la lógica de negocio y validación de transferencias vive aquí
let transfers = [
  { id: 1, jugador: 'Kylian Mbappé', origen: 'PSG', destino: 'Real Madrid', montoMillonesEUR: 0, tipo: 'Libre', anio: 2024 },
  { id: 2, jugador: 'Ricardinho', origen: 'Movistar Inter', destino: 'ACCS París', montoMillonesEUR: 1.5, tipo: 'Traspaso Futsal', anio: 2020 },
  { id: 3, jugador: 'Jude Bellingham', origen: 'Borussia Dortmund', destino: 'Real Madrid', montoMillonesEUR: 103, tipo: 'Traspaso F11', anio: 2023 }
];

export const getTransfers = (tipo) => {
  if (tipo) {
    return transfers.filter((t) => t.tipo.toLowerCase().includes(tipo.toLowerCase()));
  }
  return transfers;
};

export const processTransfer = ({ jugador, origen, destino, montoMillonesEUR, modalidad = 'F11' }) => {
  if (!jugador || !origen || !destino) {
    const err = new Error('Los campos jugador, origen y destino son requeridos.');
    err.statusCode = 400;
    throw err;
  }

  if (origen.trim().toLowerCase() === destino.trim().toLowerCase()) {
    const err = new Error('El club de origen y destino no pueden ser el mismo.');
    err.statusCode = 400;
    throw err;
  }

  const monto = montoMillonesEUR ? Number(montoMillonesEUR) : 0;
  const tipo = modalidad.toLowerCase() === 'futsal' ? 'Traspaso Futsal' : 'Traspaso F11';

  const newTransfer = {
    id: transfers.length + 1,
    jugador: jugador.trim(),
    origen: origen.trim(),
    destino: destino.trim(),
    montoMillonesEUR: monto,
    tipo,
    fechaProcesamiento: new Date().toISOString()
  };

  transfers.push(newTransfer);
  return newTransfer;
};
