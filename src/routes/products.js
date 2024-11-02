const express = require('express');
const productRoute =  express.Router();
const AsyncHandler = require('express-async-handler')
const ProductModel = require('../models/Producto.js')
const path = require('path')    
const nodemailer = require('nodemailer')

require('dotenv').config();


productRoute.get('/tienda', async(req,res)=>{
    const productos= await ProductModel.find({});
    res.json(productos)

})

productRoute.get('/tienda/:id',AsyncHandler(async(req,res)=>{
    const producto = await ProductModel.findById(req.params.id);

    if(producto){
        res.json(producto)
    }else{
        req.status(404)
        throw new Error("Producto no encontrado")
    }

}))

module.exports=productRoute