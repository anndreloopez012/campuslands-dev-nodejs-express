import { HeroService } from '../services/hero.service.js';

export const getAllHeroes = (req, res) => {
    try {
        const { lane, minWinRate } = req.query;
        const data = HeroService.listHeroes({ lane, minWinRate });

        res.status(200).json({
            ok: true,
            count: data.length,
            data
        });
    }catch (error){
        const status = error.statusCode || 500;
        res.status(status).json({
            ok: false,
            message: error.message
        });
    }
};

export const getHeroById = (req, res) => {
    try {
        const { id } = req.params;
        const hero = HeroService.findHeroById(id);

        res.status(200).json({
            ok: true,
            data: hero
        });
    } catch(error) {
        const status = error.statusCode || 500;
        res.status(status).json({
            ok: false,
            message: error.message
        });
    }
};

export const createHero = (req, res) => {
    try{
        const newHero = HeroService.addHero(req.body);

        res.status(201).json({
            ok: true,
            message: 'Héroe registrado exitosamente.',
            data: newHero
        });
    } catch(error){
        const status = error.statusCode || 400;
        res.status(status).json({
            ok: false,
            message: error.message
        });
    }
};