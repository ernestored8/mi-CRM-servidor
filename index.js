const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h1>¡Servidor CRM Activo!</h1><p>El backend de tu CRM esta funcionando correctamente.</p>');
});

app.listen(PORT, () => {
  console.log('Servidor iniciado correctamente');
});
