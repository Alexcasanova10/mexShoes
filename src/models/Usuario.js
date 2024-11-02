const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');



const UsuarioSchema = new mongoose.Schema({
  
  nombre: String,
  apellido: String,
  email: { type: String, required: true, unique: true },
  contrasenia: String,
  telefono: String,
  ciudad: String,
  estado: String,
  direccion: {
    calle: String,
    colonia: String,
    num_exterior: String
  },
  tipo_usuario: { 
    type: String, 
    enum: ['cliente','admin'], 
    required: false 
  },
  puesto: String,
  fecha_contratacion: Date,
  fecha_creacion: Date,
  status_cuenta:['Activo','Inactivo'],

  googleId: { type: String, unique: true, sparse: true }, 

  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

UsuarioSchema.methods.matchPassword = async function(enterContrasenia){
  return await bcrypt.compare(enterContrasenia, this.contrasenia)
}

UsuarioSchema.pre("save", async function(next){
  if(!this.isModified('contrasenia')){
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.contrasenia = await bcrypt.hash(this.contrasenia, salt);
})


module.exports = mongoose.model('Usuario', UsuarioSchema);

