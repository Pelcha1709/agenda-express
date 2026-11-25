const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const AGENDA_URL = 'http://www.raydelto.org/agenda.php';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/contactos', async (req, res) => {
  try {
    const response = await fetch(AGENDA_URL);

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'No se pudo obtener la lista de contactos desde el servicio remoto.'
      });
    }

    const contactos = await response.json();
    res.json(contactos);
  } catch (error) {
    console.error('Error al listar contactos:', error);
    res.status(500).json({ error: 'Error interno del servidor al listar contactos.' });
  }
});

app.post('/contactos', async (req, res) => {
  const { nombre, apellido, telefono } = req.body;

  if (!nombre || !apellido || !telefono) {
    return res.status(400).json({
      error: 'Los campos nombre, apellido y telefono son obligatorios.'
    });
  }

  try {
    // gurdar en php
    const response = await fetch(AGENDA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim()
      })
    });

    const textoRespuesta = await response.text();
    let datosRespuesta;

    try {
      datosRespuesta = JSON.parse(textoRespuesta);
    } catch {
      datosRespuesta = { mensaje: textoRespuesta };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'El servicio remoto rechazó el contacto.',
        detalle: datosRespuesta
      });
    }

    res.status(201).json({
      mensaje: 'Contacto enviado correctamente.',
      respuestaRemota: datosRespuesta
    });
  } catch (error) {
    console.error('Error al almacenar contacto:', error);
    res.status(500).json({ error: 'Error interno del servidor al almacenar contacto.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});