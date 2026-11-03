import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const COLORS = { debug: "\x1b[36m", info: "\x1b[32m", warn: "\x1b[33m", error: "\x1b[31m", reset: "\x1b[0m" };
const HISTORY_SIZE = 50;

const history = [];

function readOption(name, fallback) {
    const flag = process.argv.find((arg) => arg.startsWith(`--${name}=`));
    return flag?.split("=")[1] ?? process.env[`LOG_${name.toUpperCase()}`] ?? fallback;
}

const config = {
    level: readOption("level", "info"),
    format: readOption("format", "pretty"),
    file: readOption("file", "logs/app.log"),
};

function formatPretty({ time, level, msg, ...meta }) {
    const color = process.stdout.isTTY ? COLORS[level] : "";
    const reset = color ? COLORS.reset : "";
    const extra = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    return `${time} ${color}${level.toUpperCase().padEnd(5)}${reset} ${msg}${extra}`;
}

async function persist(line) {
    try {
        await mkdir(dirname(config.file), { recursive: true });
        await appendFile(config.file, `${line}\n`);
    } catch (error) {
        process.stderr.write(`No se pudo escribir el log en ${config.file}: ${error.message}\n`);
    }
}

function createLogger(context = {}) {
    function log(level, msg, meta = {}) {
        if (LEVELS[level] < LEVELS[config.level]) return;

        const entry = { time: new Date().toISOString(), level, msg, ...context, ...meta };
        const line = config.format === "json" ? JSON.stringify(entry) : formatPretty(entry);

        (level === "error" ? process.stderr : process.stdout).write(`${line}\n`);
        history.push(entry);
        if (history.length > HISTORY_SIZE) history.shift();
        persist(JSON.stringify(entry));
    }

    return {
        debug: (msg, meta) => log("debug", msg, meta),
        info: (msg, meta) => log("info", msg, meta),
        warn: (msg, meta) => log("warn", msg, meta),
        error: (msg, meta) => log("error", msg, meta),
        child: (extra) => createLogger({ ...context, ...extra }),
    };
}

const logger = createLogger();

export { logger, createLogger, history, config as logConfig };
