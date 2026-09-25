const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const COLORS = { debug: "\x1b[36m", info: "\x1b[32m", warn: "\x1b[33m", error: "\x1b[31m" };

function createLogger({ level = "info", format = "pretty" } = {}, context = {}) {
    function write(entryLevel, msg, meta = {}) {
        if (LEVELS[entryLevel] < LEVELS[level]) return;

        const entry = { time: new Date().toISOString(), level: entryLevel, msg, ...context, ...meta };
        const line = format === "json" ? JSON.stringify(entry) : pretty(entry);
        (entryLevel === "error" ? process.stderr : process.stdout).write(`${line}\n`);
    }

    function pretty({ time, level: lvl, msg, ...meta }) {
        const color = process.stdout.isTTY ? COLORS[lvl] : "";
        const reset = color ? "\x1b[0m" : "";
        const extra = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
        return `${time} ${color}${lvl.toUpperCase().padEnd(5)}${reset} ${msg}${extra}`;
    }

    return {
        debug: (msg, meta) => write("debug", msg, meta),
        info: (msg, meta) => write("info", msg, meta),
        warn: (msg, meta) => write("warn", msg, meta),
        error: (msg, meta) => write("error", msg, meta),
        child: (extra) => createLogger({ level, format }, { ...context, ...extra }),
    };
}

export { createLogger };
