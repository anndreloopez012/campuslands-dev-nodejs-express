import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { paracaidistas } from "../data/db.js";
import AppError from "../utils/app-error.js";
import { hashPassword } from "../utils/password.js";

// rutas solo para aprender como se ve un hash, en produccion no existirian
async function compararHashes(texto) {
    if (typeof texto !== "string" || texto.length < 1 || texto.length > 72) {
        throw new AppError(400, "Manda ?texto= con 1 a 72 caracteres");
    }

    // sha256 siempre da lo mismo, por eso no sirve solo para passwords
    const sha1 = createHash("sha256").update(texto).digest("hex");
    const sha2 = createHash("sha256").update(texto).digest("hex");

    const hash1 = await hashPassword(texto);
    const hash2 = await hashPassword(texto);

    return {
        texto,
        sha256: { intento1: sha1, intento2: sha2, iguales: sha1 === sha2 },
        bcrypt: {
            intento1: hash1,
            intento2: hash2,
            iguales: hash1 === hash2,
            // $2b$ version, 10 rondas, 22 caracteres de salt y el resto es el hash
            partes: {
                version: hash1.slice(0, 4),
                rondas: bcrypt.getRounds(hash1),
                salt: hash1.slice(7, 29),
                hash: hash1.slice(29)
            },
            losDosValidan: (await bcrypt.compare(texto, hash1)) && (await bcrypt.compare(texto, hash2))
        }
    };
}

// lo que veria alguien que se robe la "base de datos"
function verBaseDeDatos() {
    return paracaidistas.map((p) => ({ id: p.id, email: p.email, passwordHash: p.passwordHash }));
}

export { compararHashes, verBaseDeDatos };
