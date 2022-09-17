require("express-async-errors");  // usar async await
const express = require('express');
const path = require('path');


// leer archivo de configuracion
require('dotenv').config();
console.log('base', process.env.base);

require('./base-orm/sqlite-init'); // crear base si no existe

// crear servidor
const app = express();

// configurar servidor
const cors = require('cors');
app.use(cors());

app.use(express.text()); // entiende texto
app.use(express.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
app.use(express.json()); // entiende json

// sirve archivos estaticos
app.use('/', express.static(path.join(__dirname, 'public')));

//------------------------------------
//-- SWAGGER
//------------------------------------
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger/swagger_output.json'); //aqui se genera la salida
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));



//------------------------------------
//-- RUTAS ---------------------------
//------------------------------------
app.get('/', (req, res) => {
  //res.send("sitio on line, hola mundo!");
  //res.json({message: 'sitio on line'});
  //res.sendfile("./public/index.html");
  //res.sendfile("./img/imagen.jpg");
  res.redirect('/index.html');   // no haria falta, valor por defecto usado por express.static
});

const articulosfamiliasRouter = require('./routes/articulosfamilias');
const articulosfamiliasmockRouter = require('./routes/articulosfamiliasmock');
const articulosRouter = require('./routes/articulos');
const ecoRouter = require('./routes/eco');
const seguridadRouter = require('./routes/seguridad');
const jsonexternoRouter = require('./routes/jsonexterno');
const equiposRouter = require('./routes/equipos');
app.use(articulosfamiliasRouter);
app.use(articulosfamiliasmockRouter);
app.use(articulosRouter);
app.use(ecoRouter);
app.use(seguridadRouter);
app.use(jsonexternoRouter);
app.use(equiposRouter);


// test error sincrono
app.get('/testerror', (req, res) => {
  throw new Error('probando desencadenar un error');
});


// manejo de errores
const fs = require('fs/promises');
app.use( async function (err, req, res, next) {
  // logueamos el error en un archivo para luego consultarlo.
  console.error(err.stack);
  
  dato = (new Date).toLocaleString() + '\n' +  err.stack + '\n' + '\n'
  await fs.writeFile("./log.txt", dato, { flag:'a'});
  //const logFile = fs.readFile("log.txt",'utf-8');

  //enviamos al usuario un mensaje apropiado, sin dar detalles del error
  res
    .status(500)
    .send(
      'Actualmente tenemos inconvenientes con procesar su solicitud, intente nuevamente mas tarde!'
    );
});

// captura toda las peticiones que no han sido capturadas anteriormente
app.use(function(req, res, next) {
  res.status(404).send('Pagina no encontrada!');
});

//------------------------------------
//-- INICIO ---------------------------
//------------------------------------
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`sitio escuchando en el puerto ${port}`);
});
