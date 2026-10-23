const createAuthController = ({ auth }) => ({
  login: (req, res) => res.json({ ok: true, data: auth.login(req.body) }),
  me: (req, res) => res.json({ ok: true, data: req.user }),
  logout(req, res) {
    auth.logout(req.token);
    res.status(204).end();
  },
});

export { createAuthController };
