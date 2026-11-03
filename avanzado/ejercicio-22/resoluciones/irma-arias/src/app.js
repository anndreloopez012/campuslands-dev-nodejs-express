const express = require('express');
const app = express();
app.use(express.json());
app.post('/webhooks', (req, res) => {
  console.log('Webhook recibido:', req.body?.event);
  res.status(202).json({ received: true, event: req.body?.event });
});
app.listen(process.env.PORT || 3000);
