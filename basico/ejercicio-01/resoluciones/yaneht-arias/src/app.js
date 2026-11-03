const cantidad = Number(process.argv[2] || 2);
const caras = Number(process.argv[3] || 6);
const dados = [];
let total = 0;

for (let i = 0; i < cantidad; i++) {
  const dado = Math.floor(Math.random() * caras) + 1;
  dados.push(dado);
  total += dado;
}

console.log("=== Tiradas de dados RPG ===");
console.log(`Dados: ${cantidad} de ${caras} caras`);
console.log("Resultados:", dados);
console.log("Total:", total);
