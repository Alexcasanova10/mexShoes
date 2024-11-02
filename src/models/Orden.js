const mongoose = require('mongoose');

const orderItemSchema =  mongoose.Schema({
  nombre: { type: String, required: true },
  qty: { type: Number, required: true },
  imagen: { type: String, required: true },
  precio: { type: Number, required: true },
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto",
    required: true,
  },
});



const OrdenSchema = new mongoose.Schema({
  usuario_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuarios', 
    required: true 
  },
  orden_Productos: {
    type: Array,
    required: true
  },
  productos: [
    {
      _id_producto: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Producto', 
        required: true 
      },
      cantidad: { type: Number, required: true },
      precio: { type: Number, required: true }
    }
  ],
  total: { type: Number, required: true },
  estado: { type: String, enum: ['pendiente', 'completada', 'cancelada'], default: 'pendiente' },
  metodo_pago: { 
    type: String, 
    enum: ['Paypal'], 
    required: true 
  },
  direccion_envio: {
    calle: String,
    colonia: String,
    ciudad: String,
    estado: String,
    num_exterior: String
  },
  fecha_actualizacion: { type: Date, default: Date.now },
  fecha_creacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Orden', OrdenSchema);
