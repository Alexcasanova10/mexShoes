const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/Usuario.js");

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decodedToken.id).select("-contrasenia");
      console.log('User ID en pe rfil:', req.session.id); // Muestra el userId
      console.log('decode token:', decodedToken); // Verifica el contenido del token

      next();
    } catch (err) {
      console.log(err);
    }
  }
  // if (!token) {
  //   res.status(401);
  //   throw new Error("No estás autorizado");
  // }
});

module.exports = protect;
