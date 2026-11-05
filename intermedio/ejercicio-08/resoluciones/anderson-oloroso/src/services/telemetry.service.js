let hypercarTelemetries = [
  {
    id: 1,
    modelo: 'Koenigsegg Jesko Attack',
    motor: '5.0L V8 Twin Turbo',
    potenciaCV: 1600,
    velocidadPuntaRegistradaKmH: 485.5,
    ceroACienSegundos: 2.5,
    gLateralesMax: 1.45,
    circuito: 'Nürburgring Nordschleife'
  },
  {
    id: 2,
    modelo: 'Bugatti Chiron Super Sport 300+',
    motor: '8.0L W16 Quad-Turbo',
    potenciaCV: 1600,
    velocidadPuntaRegistradaKmH: 490.48,
    ceroACienSegundos: 2.4,
    gLateralesMax: 1.38,
    circuito: 'Ehra-Lessien'
  },
  {
    id: 3,
    modelo: 'Pagani Utopia',
    motor: '6.0L V12 Mercedes-AMG Twin-Turbo',
    potenciaCV: 864,
    velocidadPuntaRegistradaKmH: 354.0,
    ceroACienSegundos: 2.8,
    gLateralesMax: 1.42,
    circuito: 'Autodromo di Modena'
  }
];

export const getTelemetries = () => hypercarTelemetries;

export const recordTelemetry = (telemetryData) => {
  const newRecord = {
    id: hypercarTelemetries.length + 1,
    ...telemetryData,
    timestamp: new Date().toISOString()
  };
  hypercarTelemetries.push(newRecord);
  return newRecord;
};
