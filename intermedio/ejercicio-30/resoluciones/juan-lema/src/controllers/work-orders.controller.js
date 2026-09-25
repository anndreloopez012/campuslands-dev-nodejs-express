const createWorkOrdersController = ({ workOrders }) => ({
  list: (req, res) => res.json({ ok: true, data: workOrders.list(req.query) }),
  get: (req, res) => res.json({ ok: true, data: workOrders.getById(req.params.id) }),
  create(req, res) {
    const order = workOrders.create(req.body);
    res.status(201).location(`/work-orders/${order.id}`).json({ ok: true, data: order });
  },
  advance: (req, res) => res.json({ ok: true, data: workOrders.advance(req.params.id, req.body?.status, req.user.username) }),
  remove(req, res) {
    workOrders.remove(req.params.id);
    res.status(204).end();
  },
});

export { createWorkOrdersController };
