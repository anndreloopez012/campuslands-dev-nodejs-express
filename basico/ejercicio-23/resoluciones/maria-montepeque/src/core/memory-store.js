function createMemoryStore(seed = []) {
    const records = new Map();
    let nextId = 1;

    const now = () => new Date().toISOString();

    function insert(data) {
        const record = { id: nextId++, ...data, createdAt: now(), updatedAt: now() };
        records.set(record.id, record);
        return record;
    }

    function findAll(predicate = () => true) {
        return [...records.values()].filter(predicate);
    }

    function findById(id) {
        return records.get(Number(id)) ?? null;
    }

    function update(id, changes) {
        const current = findById(id);
        if (!current) return null;

        const updated = { ...current, ...changes, id: current.id, createdAt: current.createdAt, updatedAt: now() };
        records.set(updated.id, updated);
        return updated;
    }

    function remove(id) {
        return records.delete(Number(id));
    }

    function reset() {
        records.clear();
        nextId = 1;
        seed.forEach(insert);
    }

    reset();

    return { insert, findAll, findById, update, remove, reset, size: () => records.size };
}

export { createMemoryStore };
