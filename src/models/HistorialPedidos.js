const mongoose = require('mongoose');

const HistorialPedidosSchema = new mongoose.Schema({
  cliente_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuarios', 
    required: true 
  },
  productos: [{
    producto_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Producto', 
      required: true 
    },
    talla: { type: Number, required: true },
    cantidad: { type: Number, required: true },
    precio_unitario: { type: Number, required: true }
  }],
  fecha_compra: { type: Date, default: Date.now },
  total: { type: Number, required: true }
});

module.exports = mongoose.model('HistorialPedidos', HistorialPedidosSchema);

