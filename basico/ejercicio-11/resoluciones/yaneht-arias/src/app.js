const promesa = new Promise((resolve) => {
  resolve("Partida lista");
});

promesa.then((mensaje) => {
  console.log("=== Ejercicio 11: promesas básicas ===");
  console.log(mensaje);
});
