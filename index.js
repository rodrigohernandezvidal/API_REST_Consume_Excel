const express = require('express');
const fs = require('fs');
const xlsx = require('xlsx');
const app = express();
const PORT = 3000;

app.use(express.json());

// Función para leer el archivo Excel y convertirlo en JSON
function excelToJson(filePath) {
 try{
    if(!fs.existsSync(filePath)){
        console.error(`Archivo no encontrado: ${filePath}`);
        return [];
    }
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Usar la primera hoja
    const sheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet);
    }catch(error){
        console.error(`Error al leer el archivo Excel: ${error.message}`);
        return[];

    }   
}

// Cargar datos desde el archivo Excel
const excelData = excelToJson('Datos.xlsx');

//Ruta para la raiz del Servidor
app.get('/', (req, res) => {
    res.send(`
        <h1>Bienvenido a la API REST </h1>
        <p>Rutas disponibles:</p>
        <ul>
            <li><a href="/api/data">/api/data</a> - Obtener todos los datos</li>
            <li><a href="/api/data/1">/api/data/:id</a> - Obtener un registro por ID</li>
        </ul>    
        `);
});

// Ruta para obtener todos los datos desde el archivo Excel convertido a JSON
app.get('/api/data', (req, res) => {
  res.json(excelData);
});

// Ruta para obtener un registro específico por algún campo (e.g., ID)
app.get('/api/data/:id', (req, res) => {
  const id = req.params.id;
  const record = excelData.find(item => item.ID === parseInt(id)); // Ajusta el campo según tu Excel

  if (record) {
    res.json(record);
  } else {
    res.status(404).send({ message: 'Registro no encontrado' });
  }
});

// Ruta para agregar nuevos registros (esto solo agrega en memoria, no en el archivo Excel original)
app.post('/api/data', (req, res) => {
  const newRecord = req.body;
  excelData.push(newRecord);
  res.status(201).json(newRecord);
});

// Ruta para actualizar un registro (en memoria)
app.put('/api/data/:id', (req, res) => {
  const id = req.params.id;
  const index = excelData.findIndex(item => item.ID === parseInt(id));

  if (index !== -1) {
    excelData[index] = { ...excelData[index], ...req.body };
    res.json(excelData[index]);
  } else {
    res.status(404).send({ message: 'Registro no encontrado' });
  }
});

// Ruta para eliminar un registro (en memoria)
app.delete('/api/data/:id', (req, res) => {
  const id = req.params.id;
  const index = excelData.findIndex(item => item.ID === parseInt(id));

  if (index !== -1) {
    const deletedRecord = excelData.splice(index, 1);
    res.json(deletedRecord);
  } else {
    res.status(404).send({ message: 'Registro no encontrado' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

