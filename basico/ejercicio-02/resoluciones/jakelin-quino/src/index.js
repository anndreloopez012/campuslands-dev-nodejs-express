const command = process.argv[2] || 'ayuda';

const commands = {
  perfil: {
    juego: 'Arena Strike',
    jugador: 'Nova',
    rango: 'Oro',
    mensaje: 'Perfil competitivo cargado'
  },
  ayuda: {
    mensaje: 'Usa npm start o npm run perfil para ejecutar el programa'
  }
};

console.log(JSON.stringify(commands[command] || commands.ayuda, null, 2));