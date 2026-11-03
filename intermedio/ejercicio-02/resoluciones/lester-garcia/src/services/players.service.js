import * as playersRepo from "../repositories/players.repository.js";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

export const getAllPlayersService = async (filters = {})=>{
    let players = await playersRepo.findAllPlayers();
    const{ team, mainAgnet} = filters;

    if(team){
        players = players = players.filter((p) => p.team.toLowerCase().includes(team.toLowerCase()));

    }

    if(mainAgnet){
        players = players,filter((p)=> p.mainAgent.toLowerCase().includes(mainAgnet.toLowerCase()));

    }
    return players;
};

export const createPlayerService = async (data) => {
    const all = await playersRepo.findAllPlayers();
    const exists = all.some((p)=>p.gamerTag.toLowerCase()=== data.gamerTag.toLowerCase());

    if (exists){
        throw new ConflictError(`El gamerTag '${data.gamerTag}' ya esta registrado en la liga.`);

    }

    const newPlayer = {
        id: String(Date.now()),
        ...data,
        kdRatio: Number(data.kdRatio)
    };
    return await playersRepo.savePlayer(newPlayer);
};