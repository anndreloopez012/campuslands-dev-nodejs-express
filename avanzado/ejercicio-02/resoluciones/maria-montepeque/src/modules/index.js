import { jugadoresModulo } from "./jugadores/index.js";
import { equiposModulo } from "./equipos/index.js";
import { torneosModulo } from "./torneos/index.js";

// la lista de modulos de la app
// para agregar uno nuevo: crear su carpeta con index.js y agregarlo aqui
export const MODULOS = [jugadoresModulo, equiposModulo, torneosModulo];
