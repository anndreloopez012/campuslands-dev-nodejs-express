const url = new URL("http://localhost/jugadores/7?arma=arco");

console.log("=== Ejercicio 19: parámetros y query ===");
console.log("Ruta:", url.pathname);
console.log("Arma:", url.searchParams.get("arma"));
