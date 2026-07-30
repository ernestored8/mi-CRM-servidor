const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Configuración de OAuth2 con las variables de Render
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.REDIRECT_URI || 'https://developers.google.com/oauthplayground'
);

// Ruta principal de prueba
app.get('/', (req, res) => {
  res.send('<h1>Servidor CRM activo</h1><p>El sistema está listo para recibir peticiones.</p>');
});

// Ruta para ver las credenciales (de prueba)
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    hasClientId: !!process.env.GMAIL_CLIENT_ID,
    hasClientSecret: !!process.env.GMAIL_CLIENT_SECRET
  });
});

app.listen(PORT, () => {
  console.log(Servidor corriendo en el puerto ${PORT});
});
