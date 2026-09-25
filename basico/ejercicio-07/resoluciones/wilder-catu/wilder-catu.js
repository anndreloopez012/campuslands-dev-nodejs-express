#!/usr/bin/env node

/**
 * Wilder Catú
 * Ejercicio: process.argv y CLI
 * Temática: Autos de lujo
 *
 * Uso:
 * node wilder-catu.jjs listar
 * node wilder-catu.jjs buscar --marca Ferrari
 * node wilder-catu.jjs buscar --modelo "911"
 * node wilder-catu.jjs detalle --id 2
 */

const autos = [
    {
      id: 1,
      marca: "Ferrari",
      modelo: "SF90 Stradale",
      anio: 2024,
      precio: 575000
    },
    {
      id: 2,
      marca: "Porsche",
      modelo: "911 Turbo S",
      anio: 2024,
      precio: 230000
    },
    {
      id: 3,
      marca: "Lamborghini",
      modelo: "Revuelto",
      anio: 2024,
      precio: 608000
    },
    {
      id: 4,
      marca: "Rolls-Royce",
      modelo: "Phantom",
      anio: 2024,
      precio: 505000
    }
  ];
  
  /**
   * Muestra la ayuda de la aplicación.
   */
  function mostrarAyuda() {
    console.log(`
  ========================================
         AUTOS DE LUJO - CLI
  ========================================
  
  Comandos disponibles:
  
    listar
        Muestra todos los autos disponibles.
  
    buscar --marca <marca>
        Busca autos por marca.
  
    buscar --modelo <modelo>
        Busca autos por modelo.
  
    detalle --id <id>
        Muestra la información completa de un auto.
  
    ayuda
        Muestra esta ayuda.
  
  Ejemplos:
  
    node wilder-catu.jjs listar
  
    node wilder-catu.jjs buscar --marca Ferrari
  
    node wilder-catu.jjs buscar --modelo "911"
  
    node wilder-catu.jjs detalle --id 2
  `);
  }
  
  /**
   * Obtiene el valor de un argumento.
   *
   * Ejemplo:
   * --marca Ferrari
   *
   * @param {string[]} argumentos
   * @param {string} nombre
   * @returns {string|undefined}
   */
  function obtenerArgumento(argumentos, nombre) {
    const posicion = argumentos.indexOf(nombre);
  
    if (posicion === -1) {
      return undefined;
    }
  
    return argumentos[posicion + 1];
  }
  
  /**
   * Muestra todos los autos.
   */
  function listarAutos() {
    console.log("\n=== CATÁLOGO DE AUTOS DE LUJO ===\n");
  
    autos.forEach((auto) => {
      console.log(
        `${auto.id}. ${auto.marca} ${auto.modelo} - ${auto.anio} - $${auto.precio.toLocaleString()}`
      );
    });
  
    console.log("");
  }
  
  /**
   * Busca autos por marca o modelo.
   *
   * @param {string[]} argumentos
   */
  function buscarAutos(argumentos) {
    const marca = obtenerArgumento(argumentos, "--marca");
    const modelo = obtenerArgumento(argumentos, "--modelo");
  
    if (!marca && !modelo) {
      console.error(
        "Error: debes indicar --marca o --modelo."
      );
      console.error(
        'Ejemplo: node wilder-catu.jjs buscar --marca Ferrari'
      );
      process.exitCode = 1;
      return;
    }
  
    let resultados = autos;
  
    if (marca) {
      resultados = resultados.filter(
        (auto) =>
          auto.marca.toLowerCase() === marca.toLowerCase()
      );
    }
  
    if (modelo) {
      resultados = resultados.filter(
        (auto) =>
          auto.modelo.toLowerCase().includes(modelo.toLowerCase())
      );
    }
  
    if (resultados.length === 0) {
      console.log("\nNo se encontraron autos con esos criterios.\n");
      return;
    }
  
    console.log("\n=== RESULTADOS DE BÚSQUEDA ===\n");
  
    resultados.forEach((auto) => {
      console.log(
        `ID: ${auto.id}
  Marca: ${auto.marca}
  Modelo: ${auto.modelo}
  Año: ${auto.anio}
  Precio: $${auto.precio.toLocaleString()}
  ----------------------------------------`
      );
    });
  }
  
  /**
   * Muestra el detalle de un auto.
   *
   * @param {string[]} argumentos
   */
  function mostrarDetalle(argumentos) {
    const id = obtenerArgumento(argumentos, "--id");
  
    if (!id) {
      console.error(
        "Error: debes indicar el ID del auto."
      );
      console.error(
        "Ejemplo: node wilder-catu.jjs detalle --id 2"
      );
      process.exitCode = 1;
      return;
    }
  
    const idNumerico = Number(id);
  
    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      console.error(
        "Error: el ID debe ser un número entero positivo."
      );
      process.exitCode = 1;
      return;
    }
  
    const auto = autos.find(
      (item) => item.id === idNumerico
    );
  
    if (!auto) {
      console.error(
        `Error: no existe un auto con el ID ${idNumerico}.`
      );
      process.exitCode = 1;
      return;
    }
  
    console.log(`
  ========================================
            DETALLE DEL AUTO
  ========================================
  
  ID:      ${auto.id}
  Marca:   ${auto.marca}
  Modelo:  ${auto.modelo}
  Año:     ${auto.anio}
  Precio:  $${auto.precio.toLocaleString()}
  
  ========================================
  `);
  }
  
  /**
   * Punto de entrada de la aplicación.
   *
   * process.argv contiene los argumentos
   * enviados desde la terminal.
   */
  function main() {
    // process.argv[0] -> ruta de Node.js
    // process.argv[1] -> ruta del archivo
    // process.argv[2...] -> argumentos enviados por el usuario
  
    const argumentos = process.argv.slice(2);
  
    const comando = argumentos[0];
  
    switch (comando) {
      case "listar":
        listarAutos();
        break;
  
      case "buscar":
        buscarAutos(argumentos);
        break;
  
      case "detalle":
        mostrarDetalle(argumentos);
        break;
  
      case "ayuda":
      case "--help":
      case "-h":
        mostrarAyuda();
        break;
  
      case undefined:
        mostrarAyuda();
        break;
  
      default:
        console.error(
          `Error: comando "${comando}" no reconocido.`
        );
        console.error(
          'Usa "node wilder-catu.jjs ayuda" para ver las opciones.'
        );
        process.exitCode = 1;
    }
  }
  
  main();