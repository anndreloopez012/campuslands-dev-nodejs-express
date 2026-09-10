const DAILY_RATE = 150;

function parseArgs(argv) {
    const flags = new Map();

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        const eqMatch = arg.match(/^--([\w-]+)=(.+)$/);
        if (eqMatch) {
            flags.set(eqMatch[1], eqMatch[2]);
            continue;
        }

        const flagMatch = arg.match(/^--([\w-]+)$/);
        if (flagMatch) {
            const next = argv[i + 1];
            if (next && !next.startsWith("--")) {
                flags.set(flagMatch[1], next);
                i++;
            } else {
                flags.set(flagMatch[1], true);
            }
        }
    }

    return flags;
}

function quoteRental(flags) {
    const brand = flags.get("brand");
    if (!brand || typeof brand !== "string" || !brand.trim()) {
        throw new Error("--brand es obligatorio");
    }

    const days = Number(flags.get("days"));
    if (!Number.isInteger(days) || days <= 0) {
        throw new Error("--days debe ser un numero entero mayor a 0");
    }

    let discount = 0;
    if (days >= 14) discount = 0.2;
    else if (days >= 7) discount = 0.1;
    else if (days >= 3) discount = 0.05;

    const subtotal = days * DAILY_RATE;
    const total = Math.round(subtotal * (1 - discount));

    return {
        brand: brand.trim(),
        days,
        discount: `${discount * 100}%`,
        total,
    };
}

export { parseArgs, quoteRental };