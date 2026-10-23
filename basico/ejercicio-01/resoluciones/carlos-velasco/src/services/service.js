import users from '../data/data.js';

export const obtenerUsuarios = async () => {
    try {
        // Aquí haces tu validación

        return users;

    } catch (error) {
        console.error('Type error of:', error.message);
    }
};