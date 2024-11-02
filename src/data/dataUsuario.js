
const bcrypt = require('bcryptjs')

const user =[
    {
        nombre: "Admin",
        email: "admin@ejemplo.com",
        contrasenia: bcrypt.hashSync("123456", 10),
        tipo_usuario: "admin"
    },
    
    {
        nombre: "Cliente",
        email: "cliente@ejemplo.com",
        contrasenia: bcrypt.hashSync("123456", 10),
        tipo_usuario: "cliente"
    }
] 

module.exports = user;