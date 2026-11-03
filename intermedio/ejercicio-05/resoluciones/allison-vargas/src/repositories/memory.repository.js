export class MemoryRepository {
  #items;
  #nextId;

  constructor(seed = []) {
    this.#items = seed.map((item) => ({ ...item }));
    this.#nextId = Math.max(0, ...seed.map((item) => item.id)) + 1;
  }

  findAll(predicate = () => true) {
    return this.#items.filter(predicate).map((item) => ({ ...item }));
  }

  findById(id) {
    const item = this.#items.find((i) => i.id === id);
    return item ? { ...item } : null;
  }

  findOne(predicate) {
    const item = this.#items.find(predicate);
    return item ? { ...item } : null;
  }

  count(predicate = () => true) {
    return this.#items.filter(predicate).length;
  }

  create(data) {
    const item = { id: this.#nextId++, ...data };
    this.#items.push(item);
    return { ...item };
  }

  update(id, data) {
    const index = this.#items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    this.#items[index] = { ...this.#items[index], ...data, id };
    return { ...this.#items[index] };
  }

  delete(id) {
    const index = this.#items.findIndex((i) => i.id === id);
    if (index === -1) return false;
    this.#items.splice(index, 1);
    return true;
  }
}
