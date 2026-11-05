const checkHero = (nombre, rol, hp) => {
    let estado = 'Listo para la batalla';
    if (hp <= 0) {
        estado = 'Caído en combate';
    } else if (hp <= 30) {
        estado = 'Estado crítico';
    }

    console.log('\n=== REPORTE DE INSPECCIÓN DE HÉROE (CONSOLE TABLE) ===');
    console.table([{
        Nombre: nombre,
        Clase: rol,
        HP: hp,
        Estado: estado
    }]);

    return {
        nombre,
        rol,
        hp,
        estado
    };
};

const getRuntimeInfo = () => {
    return {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        pid: process.pid,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMB: {
            rss: (process.memoryUsage().rss / (1024 * 1024)).toFixed(2),
            heapTotal: (process.memoryUsage().heapTotal / (1024 * 1024)).toFixed(2),
            heapUsed: (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2)
        }
    };
};

module.exports = {
    checkHero,
    getRuntimeInfo
};
