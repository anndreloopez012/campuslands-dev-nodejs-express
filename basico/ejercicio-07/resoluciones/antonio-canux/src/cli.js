import { getCars, addCar } from './services/cars.service.js';

// process.argv devuelve un array. Los primeros 2 elementos son la ruta de Node y del archivo.
// Cortamos desde el índice 2 para obtener nuestros propios argumentos.
const args = process.argv.slice(2);
const command = args[0];

if (command === 'listar') {
    console.log('\n--- Catálogo de Autos de Lujo ---');
    console.table(getCars());
    console.log('---------------------------------\n');
    
} else if (command === 'agregar') {
    const brand = args[1];
    const model = args[2];
    const year = args[3];

    // Validación básica de CLI
    if (!brand || !model || !year) {
        console.error('❌ Error: Faltan argumentos.');
        console.log('💡 Uso correcto: npm run cli agregar <marca> <modelo> <año>');
        process.exit(1);
    }

    const newCar = addCar(brand, model, year);
    console.log('✅ Auto de lujo agregado exitosamente:', newCar);
    
} else {
    console.error('❌ Comando no reconocido.');
    console.log('💡 Comandos disponibles: listar | agregar <marca> <modelo> <año>');
}