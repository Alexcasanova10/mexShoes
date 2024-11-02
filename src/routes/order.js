const express = require('express');
const orderRoute =  express.Router();
const protect = require("../middlewares/Auth.js");
const AsyncHandler = require('express-async-handler')
const OrderModel = require('../models/Orden.js')
const path = require('path')    
const nodemailer = require('nodemailer')


orderRoute.post("/",protect, asyncHandler(async (req, res) => {
    const {
      orderItems,
      shippingAddress,
      paymentMethods,
      shippingPrice,
      taxPrice,
      totalPrice,
      price,
    } = req.body;
    console.log(orderItems)

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error("no order items found");
    } else {
      const order = new Order({
        orderItems,
        shippingAddress,
        paymentMethods,
        shippingPrice,
        taxPrice,
        totalPrice,
        price,
        user: req.user._id,
      });

      // const newOrder =  new UserOrder({
      //   userId: '1',
      //   customerId: '1',
      //   productId: '652b2e458077fd5b243a06ad',
      //   quantity: 1,
      //   subtotal: 12 / 100,
      //   total: 12 / 100,
      //   payment_status: '3',
      // });

      const createdOrder = await order.save();
      res.status(201).json(createdOrder);
    }
  })
);
