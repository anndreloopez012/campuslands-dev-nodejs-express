import { heroes } from '../data/hero.data.js';

export class HeroService {
    static listHeroes({ lane, minWinRate } = {}){
        let result = [...heroes];

        if (lane) {
            result = result.filter(h => h.lane.toLowerCase() === lane.toLowerCase());
        }

        if(minWinRate){
            const parsedRate = Nunmber(minWinRate);
            if(!isNaN(parsedRate)){
                result = result.filter(h => h.winRate >= parsedRate);
            }
        }
        return result;
    }

    static findHeroById(id){
        const hero = heroes.find(h => h.id === Number(id));
        if(!hero){
            const error = new Error(`Héroe con ID ${id} no encontrado.`);
            error.statusCode = 404;
            throw error;
        }
        return hero;
    }

    static addHero(payload){
        const { name, lane, winRate = 50.0, difficulty = "Media" } = payload;

        if(!name || !name.trim()){
            const error = new Error('El nombre del héroe es requerido.');
            error.statusCode = 400;
            throw error;
        }

        const validLanes = ['Mid', 'Carry', 'Support', 'Offlane', 'Jungler'];
        if(!validLanes.includes(lane)){
            const error = new Error(`Línea inválida. Líneas válidas: ${validLanes.join(', ')}`);
            error.statusCode = 400;
            throw error;
        }

        const exists = heroes.some(h => h.name.toLowerCase() === name.trim().toLowerCase());
        if(exists){
            const error = new Error(`El héroe '${name}' ya se encuentra registrado.`);
            error.statusCode = 400;
            throw error;
        }

        const newHero = {
            id: heroes.length > 0 ? Math.max(...heroes.map(h => h.id)) + 1 : 1,
            name: name.trim(),
            lane,
            winRate: Number(winRate),
            difficulty
        };

        heroes.push(newHero);
        return newHero;
    }
}