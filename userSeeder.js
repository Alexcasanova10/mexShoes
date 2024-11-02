const Usuario = require('./src/models/Usuario.js');
const dataUsuario = require('./src/data/dataUsuario.js')
const router = require('express').Router();
const connectDb = require('./src/config/conexion.js')



router.post('/users', async(req,res)=>{
    await Usuario.deleteMany({});

    const userSeeder = await Usuario.insertMany(dataUsuario)
    res.send({userSeeder}) 
});

connectDb()
 
module.exports = router;
 