const mongoose = require('mongoose');

const ReabastecimientoSchema = new mongoose.Schema({
  producto_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Producto', 
    required: true 
  },
  cantidad: { type: Number, required: true },
  costo_reabastecimiento: Number,
  fecha_reabastecimiento: { type: Date, default: Date.now },
  empleado_operacion: {
    empleado_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    nombre: { type: String, required: true },
    apellido: { type: String, required: true }
  }
});

module.exports = mongoose.model('Reabastecimiento', ReabastecimientoSchema);
