const mongoose = require('mongoose');

const enumSizes = [24,24.5,25,25.5,26,26.5,27,27.5,28,28.5,29,29.5];
const enumMarca = ["Adidas","Nike","Puma","Reebook","Charly","Fila","Panam","Otras"];

const ProductoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  cantidad: { type: Number, required: true },
  marca: { 
    type: String, 
    enum: enumMarca, 
    required: true 
  },
  imagenes: {
    imagen1: { type: String },
    imagen2: { type: String },
    imagen3: { type: String }
  },
  tallas: {
    type: [Number],
    enum: enumSizes,
    required: true
  },
  fecha_agregado: { type: Date, default: Date.now },
  fecha_actualizacion: { type: Date },
  estado: { type: String, enum: ['disponible', 'descontinuado'], default: 'disponible' }
});

module.exports = mongoose.model('Producto', ProductoSchema);
