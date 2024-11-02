const express = require('express');
const userRoute =  express.Router();
const AsyncHandler = require('express-async-handler')
const UsuarioModel = require('../models/Usuario.js')
const bcrypt = require('bcryptjs');
const path = require('path')
const generateToken = require('../../tokenGenerate.js')


const protect = require('../middlewares/Auth.js')
// const checkUserRole = require('../middlewares/checkUserRole.js')

const crypto = require('crypto')
const nodemailer = require('nodemailer')

require('dotenv').config();

// const authMiddleware = (req, res, next) => {
//     if (req.session.userId) {
//         next();
//     } else {
//         res.status(401).json({ message: 'No estás autenticado' });
//     }
// };

//RUTAS DE USUARIO

//register
userRoute.post('/registrarse', AsyncHandler(async(req,res)=>{
    const { nombre, apellido, email, contrasenia, tipo_usuario, puesto } = req.body;

    const existUser=  await UsuarioModel.findOne({email})

    if(existUser){
       res.status(400)
       throw new Error('El usuario ya existe') 
    }
    
    let newUser= {
        nombre,
        apellido,
        email,
        contrasenia,
        tipo_usuario
    }

    if(tipo_usuario === 'empleado' || tipo_usuario === 'admin'){
        newUser ={
            ...newUser,
            puesto,
            fecha_contratacion: new Date(),
            fecha_creacion: new Date()
        }
    }
    const user= await UsuarioModel.create(newUser)


    if(user){
        res.status(201).json({
            _id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            tipo_usuario: user.tipo_usuario,      
            fecha_contratacion: user.fecha_contratacion,
            fecha_creacion: user.fecha_creacion      
        })
 
    }else{
        res.status(400);
        throw new Error('Información de usuario inválida')
    }
}))

//login
userRoute.post('/login', AsyncHandler(async(req,res)=>{
    const {email,contrasenia} = req.body;
    const User = await UsuarioModel.findOne({email})

    if(User && (await User.matchPassword(contrasenia))){
        req.session.userId = User._id;
        console.log('User ID guardado en la sesión:', req.session.userId); // Agregar esta línea
        req.session.userEmail= User.email;

        res.cookie('userSession', User._id, { 
            httpOnly: true,
            secure: false,
            maxAge: 1000*60*60,
            path: '/' // 1 hora de session 
        }); 

        if (User.tipo_usuario === 'admin') {
            // Redirigir al dashboard si es admin
            res.json({
                _id: User.id,
                nombre: User.nombre,
                email: User.email,
                token: generateToken(User._id),
                tipo_usuario: User.tipo_usuario,
                redirectTo: '/dashboard' // redirigir a dashboard
            });
        } else {
            // Redirigir al perfil si es cliente
            res.json({
                _id: User.id,
                nombre: User.nombre,
                email: User.email,
                token: generateToken(User._id),
                tipo_usuario: User.tipo_usuario,
                redirectTo: '/perfil' 
            });
        }   
    }else{
        res.status(401);
        throw new Error('Correo o contraseña inválidos');
    } 
}))

//logout
userRoute.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.status(500).send('Error al cerrar sesión');
        }  

        res.clearCookie('userSession');
        res.json({ message: 'Logout exitoso' });
    });
});

//revisa si la sesión está activa, solo pa postman
userRoute.get('/check-session', (req, res) => {
    if (req.session.userId) {
        return res.json({
            sessionExists: true,
            message: 'Session found.',
            userId: req.session.userId,
            userEmail: req.session.userEmail
        });
    } else {
        return res.json({
            sessionExists: false,
            message: 'No session found.'
        });
    }
});

userRoute.get('/dashboard', (req, res) => {
    res.send('Bienvenido al dashboard');
});
 


userRoute.get("/perfil",protect,AsyncHandler(async (req, res) => {
    // const User = await UsuarioModel.findById(req.User.id);
    const User = await UsuarioModel.findById(req.user._id);
    console.log(req.user);
    //req.session.userId
    if (User) {
        // res.sendFile(path.join(__dirname,'../perfiltemp.html'));

        // console.log('User ID en perfil:', req.session.userId); // Muestra el userId
        // console.log('User ID en perfil:', decodedToken.id); // Muestra el userId
      res.json({
        _id: User.id,
        nombre: User.nombre,
        email: User.email,
        tipo_usuario: User.tipo_usuario,
        direccion:{
            calle: User.direccion.calle,
            colonia:User.direccion.colonia,
            num_exterior: User.direccion.num_exterior
          }
        
        
      });
    } else {
      res.status(404);
      throw new Error("USUARIO NO ENCONTRADO");
    }
 



  })
);







//recuperar contraseña
userRoute.post('/recuperar', AsyncHandler(async(req,res)=>{
    const {email} = req.body;

    const user = await UsuarioModel.findOne({email});

    if(!user){
        res.status(404);
        throw new Error('Usuario no encontrado')
    }

    //generar token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    //configuracion correo

    const transporter= nodemailer.createTransport({
        service: 'Gmail',
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    }) 

    // Configurar y enviar correo electrónico
    let nombre = user.nombre;
    const mailOptions = {
        to: user.email,
        from: '2123300393@soy.utj.edu.mx',
        subject: `Hola ${nombre}, tu token de recuperación de contraseña está aquí `,
        text: `Sigue el enlace para restablecer tu contraseña: 
        http://localhost:9000/reset/${token}`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Correo de recuperación enviado' });
}))

//token recuperacion contraseña
userRoute.post('/reset/:token', AsyncHandler(async (req, res) => {
    const user = await UsuarioModel.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        res.status(400);
        throw new Error('Token inválido o expirado');
    }

    user.contrasenia = await bcrypt.hash(req.body.contrasenia, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ 
        message: 'Contraseña actualizada',
        contrasenia:  user.contrasenia
    });
}));



//actualizar info de usuario cliente
userRoute.put('/perfil',protect, AsyncHandler(async(req,res)=>{
    const user= await UsuarioModel.findById(req.user._id);
    if(user){
        user.nombre = req.body.nombre || user.nombre; 
        user.apellido= req.body.apellido || user.apellido
        user.telefono= req.body.telefono || user.telefono

        user.ciudad=req.body.ciudad || user.ciudad
        user.estado=req.body.estado || user.estado

        if(req.body.direccion){
            user.direccion ={
              calle: req.body.direccion.calle || user.direccion.calle,
              colonia:req.body.direccion.colonia || user.direccion.colonia,
              num_exterior: req.body.direccion.num_exterior || user.direccion.num_exterior
            }
        }

        if(req.body.status_cuenta){

            if (req.body.status_cuenta === 'Activo' || req.body.status_cuenta === 'Inactivo') {
                user.status_cuenta = req.body.status_cuenta;
            } else {
                return res.status(400).json({ message: 'El estado de la cuenta solo puede ser Activo o Inactivo' });
            }        
        }

        if(req.body.contrasenia){
            user.contrasenia= await bcrypt.hash(req.body.contrasenia,10); 
        }


        const actualizarUser= await user.save();
        res.json({
            nombre: actualizarUser.nombre, 
            apellido:   actualizarUser.apellido, 
            telefono:   actualizarUser.telefono, 
            ciudad:  actualizarUser.ciudad,
            estado:  actualizarUser.estado,
            token:generateToken(actualizarUser._id),
            direccion:{
                calle: actualizarUser.direccion.calle,
                colonia:actualizarUser.direccion.colonia,
                num_exterior: actualizarUser.direccion.num_exterior
              }
        });
    }else{
        req.status(400);
        throw new Error('Usuario no encontrado')
    }
}))

//actualizar estado de la cuenta, si es ctivo o inactivo
userRoute.put('/perfil/status', AsyncHandler(async (req, res) => {
    const user = await UsuarioModel.findById(req.body._id);

    if (user) {
        const estadosValidos = ['Activo', 'Inactivo'];
        if (req.body.status_cuenta && estadosValidos.includes(req.body.status_cuenta)) {
            user.status_cuenta = req.body.status_cuenta;
        } else {
            return res.status(400).json({ message: 'Estado de cuenta no válido, debe ser Activo o Inactivo' });
        }

        const actualizarUser = await user.save();
        res.json(actualizarUser);
    } else {
        res.status(400).json({ message: 'Usuario no encontrado' });
    }
}));




//actualizar info de usuario admin
userRoute.put('/perfil/admin', AsyncHandler(async (req, res) => {
    const user = await UsuarioModel.findById(req.body._id);

    if (user) {
        // Si el usuario es admin, permitir la edición de estos campos adicionales
        if (user.tipo_usuario === 'admin') {
            user.puesto = req.body.puesto || user.puesto;
            user.fecha_contratacion = req.body.fecha_contratacion || user.fecha_contratacion;
            user.fecha_creacion = req.body.fecha_creacion || user.fecha_creacion;
        }

        // Campos comunes que pueden ser actualizados para cualquier usuario
        user.nombre = req.body.nombre || user.nombre; 
        user.apellido = req.body.apellido || user.apellido;
        user.telefono = req.body.telefono || user.telefono;
        user.ciudad = req.body.ciudad || user.ciudad;
        user.estado = req.body.estado || user.estado;

        if (req.body.direccion) {
            user.direccion = {
                calle: req.body.direccion.calle || user.direccion.calle,
                colonia: req.body.direccion.colonia || user.direccion.colonia,
                num_exterior: req.body.direccion.num_exterior || user.direccion.num_exterior
            };
        }

        if (req.body.contrasenia) {
            user.contrasenia = await bcrypt.hash(req.body.contrasenia, 10);
        }

        // Guardar los cambios en la base de datos
        const updatedUser = await user.save();
        res.json(updatedUser);

    } else {
        res.status(400);
        throw new Error('Usuario no encontrado');
    }
}));


module.exports = userRoute;