const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Inicializar DB
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        telefono VARCHAR(50),
        origen VARCHAR(50),
        estado VARCHAR(50) DEFAULT 'Nuevo',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabla lista.');
  } catch (err) {
    console.error('Error DB:', err);
  }
}
initDB();

// TOKEN DE VERIFICACIÓN (Podes cambiar este texto por el que quieras)
const VERIFY_TOKEN = "mi_token_crm_2026";

// 1. Endpoint para que Meta verifique el Webhook
app.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.challenge'];
  const challenge = req.query['hub.challenge'];

  if (mode && req.query['hub.verify_token'] === VERIFY_TOKEN) {
    console.log('Webhook de WhatsApp verificado correctamente.');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 2. Endpoint que recibe los mensajes entrantes de WhatsApp
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const body = req.body;

    if (body.object) {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];
      const contact = value?.contacts?.[0];

      if (message) {
        const telefono = message.from; // Número de WhatsApp
        const nombre = contact?.profile?.name || 'Cliente WhatsApp';

        // Guardar automáticamente en la Base de Datos
        await pool.query(
          'INSERT INTO clientes (nombre, telefono, origen, estado) VALUES ($1, $2, $3, $4)',
          [nombre, telefono, 'WhatsApp', 'Nuevo']
        );

        console.log(¡Nuevo lead guardado desde WhatsApp!: ${nombre} (${telefono}));
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error procesando WhatsApp:', error);
    res.sendStatus(500);
  }
});

// API para la pantalla web
app.get('/api/clientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  const { nombre, email, telefono, origen, estado } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO clientes (nombre, email, telefono, origen, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, email, telefono, origen || 'Otro', estado || 'Nuevo']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(Servidor en puerto ${PORT});
});
