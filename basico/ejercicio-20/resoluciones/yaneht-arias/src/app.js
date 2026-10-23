const texto = '{"nombre":"Nova","nivel":3}';

try {
  const cuerpo = JSON.parse(texto);
  console.log("=== Ejercicio 20: cuerpo JSON ===");
  console.log(cuerpo);
} catch (error) {
  console.error("El cuerpo no es válido.");
}
