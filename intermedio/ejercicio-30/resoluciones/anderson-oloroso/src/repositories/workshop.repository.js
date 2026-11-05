class WorkshopRepository {
  constructor() {
    this.records = new Map([
      [
        1,
        {
          id: 1,
          placa: 'HON-750',
          cliente: 'Mateo Gómez',
          marca: 'Honda',
          modelo: 'CB650R',
          cilindrada: 649,
          tipoMantenimiento: 'preventivo',
          costoUSD: 110,
          estado: 'Completado'
        }
      ],
      [
        2,
        {
          id: 2,
          placa: 'DUC-959',
          cliente: 'Valentina Restrepo',
          marca: 'Ducati',
          modelo: 'Panigale V2',
          cilindrada: 955,
          tipoMantenimiento: 'desmodronico',
          costoUSD: 450,
          estado: 'En Proceso'
        }
      ]
    ]);
  }

  async findAll() {
    return Array.from(this.records.values());
  }

  async findById(id) {
    return this.records.get(Number(id)) || null;
  }

  async create(record) {
    const id = this.records.size > 0 ? Math.max(...this.records.keys()) + 1 : 1;
    const newRecord = { id, ...record, estado: 'Registrado en Taller' };
    this.records.set(id, newRecord);
    return newRecord;
  }
}

export const workshopRepository = new WorkshopRepository();
