const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a la base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Crear tabla si no existe
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
    console.log('Tabla de clientes verificada/creada.');
  } catch (err) {
    console.error('Error iniciando la base de datos:', err);
  }
}
initDB();

// API: Obtener clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Guardar nuevo cliente
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
  console.log(Servidor activo en puerto ${PORT});
});
