// Básico - Ejercicio 03: Módulos CommonJS
const { getChampion, heroes } = require('./service/app.service.js');

function main() {
    console.log('========== MOBA ESPORTS DRAFT (CommonJS) ==========');

    const args = process.argv.slice(2);
    const teamName = args[0] || 'T1 Esports';

    try {
        const draftResult = getChampion(teamName);
        console.log(`\nSelección completada para el equipo: [${draftResult.equipo.toUpperCase()}]`);
        console.table([draftResult]);
    } catch (err) {
        console.error(`\n[ERROR]: ${err.message}`);
        process.exitCode = 1;
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };
