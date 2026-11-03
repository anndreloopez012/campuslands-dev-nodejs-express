import "dotenv/config";

// el repo se puede elegir con REPO=archivo en el .env o con --repo=archivo
const argRepo = process.argv.find((a) => a.startsWith("--repo="))?.split("=")[1];
const repo = argRepo || process.env.REPO || "memoria";

if (!["memoria", "archivo"].includes(repo)) {
    throw new Error(`REPO debe ser memoria o archivo, llego "${repo}"`);
}

const config = Object.freeze({
    port: Number(process.env.PORT) || 4002,
    repo,
    dataDir: process.env.DATA_DIR || "./data"
});

export default config;
