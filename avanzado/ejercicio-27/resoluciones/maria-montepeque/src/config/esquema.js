// todas las opciones de configuracion en un solo lugar
// cada una dice: de que variable de entorno sale, de que tipo es, su valor por defecto,
// si es obligatoria (y en que entornos) y si es secreta (no se muestra nunca)

export const ESQUEMA = {
    puerto: { env: "PORT", tipo: "entero", min: 1, max: 65535, defecto: 4027 },
    entorno: { env: "NODE_ENV", tipo: "enum", valores: ["development", "test", "production"], defecto: "development" },
    region: { env: "REGION", tipo: "enum", valores: ["LAN", "LAS", "NA", "EUW", "KR"], defecto: "LAN" },
    urlBase: { env: "URL_BASE", tipo: "url", defecto: "http://localhost:4027" },
    logNivel: { env: "LOG_NIVEL", tipo: "enum", valores: ["debug", "info", "warn", "error"], defecto: "info" },

    // reglas del draft (seleccion de heroes)
    draft: {
        tamanoEquipo: { env: "DRAFT_TAMANO_EQUIPO", tipo: "entero", min: 1, max: 5, defecto: 5 },
        bansPorEquipo: { env: "DRAFT_BANS", tipo: "entero", min: 0, max: 5, defecto: 3 },
        tiempoTurno: { env: "DRAFT_TIEMPO_TURNO", tipo: "duracion", defecto: "30s" }
    },

    // feature flags
    funciones: {
        modoRanked: { env: "FUNCION_RANKED", tipo: "booleano", defecto: false },
        heroesNuevos: { env: "FUNCION_HEROES_NUEVOS", tipo: "booleano", defecto: false }
    },

    // secretos: obligatorios en produccion
    secretos: {
        apiKeyEstadisticas: { env: "API_KEY_ESTADISTICAS", tipo: "texto", minLargo: 20, secreto: true, obligatorioEn: ["production"] },
        jwtSecreto: { env: "JWT_SECRETO", tipo: "texto", minLargo: 32, secreto: true, obligatorioEn: ["production"], defecto: "solo-para-desarrollo-no-usar-en-prod-1234" }
    }
};
