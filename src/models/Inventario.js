const mongoose = require('mongoose');

const InventarioSchema = new mongoose.Schema({
  producto: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Producto', 
    required: true 
  },
  cantidad_disponible: { type: Number, required: true },
  fecha_reabastecimiento: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventario', InventarioSchema);
