function esperar(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function jugarPartido() {
  console.log('Preparando partido...');

  await esperar(2000);

  console.log('El partido terminó.');
  console.log('Resultado: 11 - 8');
}

jugarPartido();