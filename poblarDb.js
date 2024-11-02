require('dotenv').config();
const mongoose = require('mongoose');
const Producto = require('./src/models/Producto.js');
const Usuario = require('./src/models/Usuario.js');
const CarritoCompras = require('./src/models/CarritoCompras.js');
const Inventario = require('./src/models/Inventario.js');
const Reabastecimiento = require('./src/models/Reabastecimiento.js');
const Orden = require('./src/models/Orden.js');
const HistorialPedidos = require('./src/models/HistorialPedidos.js');

// Conectar a MongoDB Atlas
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB conectado');
    } catch (err) {
        console.error('Error de conexión:', err.message);
        process.exit(1);
    }
};

// Datos de Prueba
const productosData = [
    { nombre: 'Producto A', descripcion: 'Descripción A', precio: 50, cantidad: 10, marca: 'Nike', tallas: [24, 25, 26] },
    { nombre: 'Producto B', descripcion: 'Descripción B', precio: 70, cantidad: 5, marca: 'Adidas', tallas: [26, 27, 28] },
    // Agrega hasta 20 productos
];

const usuariosData = [
    { nombre: 'Juan', apellido: 'Pérez', email: 'juan@correo.com', tipo_usuario: 'cliente' },
    { nombre: 'Ana', apellido: 'Gómez', email: 'ana@correo.com', tipo_usuario: 'empleado' },
    // Añadir más usuarios
];

// Funciones para poblar cada colección
const poblarProductos = async () => {
    await Producto.deleteMany();
    return await Producto.insertMany(productosData);
};

const poblarUsuarios = async () => {
    await Usuario.deleteMany();
    return await Usuario.insertMany(usuariosData);
};

const poblarCarritoCompras = async (usuarios, productos) => {
    const carritosData = usuarios.map(user => ({
        userId: user._id,
        carro_productos: [{ producto_id: productos[0]._id, cantidad: 2, precioProducto: productos[0].precio }],
        total_precio: productos[0].precio * 2
    }));
    await CarritoCompras.deleteMany();
    return await CarritoCompras.insertMany(carritosData);
};

const poblarInventario = async (productos) => {
    const inventarioData = productos.map(producto => ({
        producto: producto._id,
        cantidad_disponible: producto.cantidad
    }));
    await Inventario.deleteMany();
    return await Inventario.insertMany(inventarioData);
};

const poblarReabastecimiento = async (productos, usuarios) => {
    const reabastecimientosData = productos.map(producto => ({
        producto_id: producto._id,
        cantidad: 10,
        costo_reabastecimiento: producto.precio * 10,
        empleado_operacion: { empleado_id: usuarios[1]._id, nombre: usuarios[1].nombre, apellido: usuarios[1].apellido }
    }));
    await Reabastecimiento.deleteMany();
    return await Reabastecimiento.insertMany(reabastecimientosData);
};

const poblarOrdenes = async (usuarios, productos) => {
    const ordenesData = usuarios.map(user => ({
        usuario_id: user._id,
        productos: [{ _id_producto: productos[0]._id, cantidad: 1, precio: productos[0].precio }],
        total: productos[0].precio,
        metodo_pago: 'Paypal',
        direccion_envio: { calle: 'Calle Falsa', colonia: 'Colonia X', ciudad: 'Ciudad Y' }
    }));
    await Orden.deleteMany();
    return await Orden.insertMany(ordenesData);
};

const poblarHistorialPedidos = async (usuarios, productos) => {
    const pedidosData = usuarios.map(user => ({
        cliente_id: user._id,
        productos: [{ producto_id: productos[1]._id, talla: 26, cantidad: 1, precio_unitario: productos[1].precio }],
        total: productos[1].precio
    }));
    await HistorialPedidos.deleteMany();
    return await HistorialPedidos.insertMany(pedidosData);
};

// Poblar todas las colecciones
const poblarDB = async () => {
    await connectDB();
    const productos = await poblarProductos();
    const usuarios = await poblarUsuarios();
    await poblarCarritoCompras(usuarios, productos);
    await poblarInventario(productos);
    await poblarReabastecimiento(productos, usuarios);
    await poblarOrdenes(usuarios, productos);
    await poblarHistorialPedidos(usuarios, productos);
    console.log('Base de datos poblada exitosamente');
    mongoose.connection.close();
};

poblarDB();
