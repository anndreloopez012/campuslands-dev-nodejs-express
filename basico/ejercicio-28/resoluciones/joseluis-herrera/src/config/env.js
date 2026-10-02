import "dotenv/config";

export const PORT = process.env.PORT || 3000;

export const NODE_ENV =
    process.env.NODE_ENV || "development";

export const API_NAME =
    process.env.API_NAME || "Battle Royale API";