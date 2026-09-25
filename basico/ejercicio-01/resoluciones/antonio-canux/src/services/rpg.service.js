const ejecutarEjercicio = () => {
    // Simulamos un proceso en el servidor (mostrado en consola)
    console.log("[Log del Gremio] ⚔️ Un aventurero ha invocado el servicio de Node runtime.");

    // Retornamos los datos tal como los pide el requerimiento
    return {
        ok: true,
        message: "Ejercicio ejecutado correctamente",
        topic: "Node runtime y consola",
        rpg_context: "Has entrado con éxito a la taberna de Express.js"
    };
};

module.exports = {
    ejecutarEjercicio
};