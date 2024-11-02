const express = require('express')
const connectDb = require('./config/conexion.js')
const dotenv  = require('dotenv')
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./passportConfig.js'); 

const userRoute = require('../src/routes/user.js')
const productRoute = require('../src/routes/products.js')

const userSeeder = require('../userSeeder.js')
const path = require('path')
const cors = require('cors');



// const checkAuth = require('./middlewares/checkAuth.js') // Middleware de autenticación
// const checkUserRole = require('./middlewares/checkUserRole.js');


const app = express();
connectDb();
dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: 'tu_secreto',
    resave: false,
    saveUninitialized: true,//antes estaba en false 
    
    //process.env.NODE_ENV === 'production' cuando ya este en etapa de production, en secure poner esa var de entonrno
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 // 1 hora
    }
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(cors({
    origin: 'http://localhost:9000', // Asegúrate de que coincida con tu frontend
    credentials: true // Habilita las credenciales para permitir el envío de cookies
}));





const PORT = process.env.PORT||9000;
const router = express.Router();

app.get('/',(req,res)=>{
    res.send('Bienvenido al backend del ecommerce');
})

 

// function isAuthenticated(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     } else {
//         res.redirect('/login');
//     }
// }

// app.get('/check-session', (req, res) => {
//     if (req.isAuthenticated()) {
//         res.json({ sessionExists: true, user: req.user });
//     } else {
//         res.json({ sessionExists: false });
//     }
// });


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname,'loginex.html'));
});

app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { 
            res.json({ message: "LOGOUT EXITOSO DE GOOGLE"});
            return next(err); 
        }
        req.session.destroy(function(err) {
            if (err) {
                console.log('Error destruyendo la sesión:', err);
            }
   
            res.redirect('/login');
        });
    });
});


app.get('/auth/google', (req, res, next) => {
    //process.env.GOOGLE_REDIRECT_URI
    console.log("Redireccionando a Google con URI:",process.env.GOOGLE_REDIRECT_URI );
    next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: '/login' 
    }), 
    (req, res) => {
        res.redirect('/perfil');
    }
);

// Ruta para mostrar perfil del usuario, asegurando autenticación
// app.get('/perfil',(req, res) => {
//     // res.send(`Bienvenido a tu perfil, ${req.user.nombre}`);
//     res.sendFile(path.join(__dirname,'perfiltemp.html'));
// });

// app.get('/dashboard',(req, res) => {
//     res.send('binevenido admin')
// });

 
app.listen(PORT || 9000, ()=>{
    console.log(`Servidor corriendo en puerto ${PORT}`);
})

//rutas de Login, Register usuario
// app.use('/usuario', userRoute);
app.use(userRoute);
app.use(productRoute);
//Rutas de seed
app.use('/seed/', userSeeder);

/*MONGO_URI = mongodb+srv://2123300393:U9OhCGjDdLtHcgV5@cluster0.uzhge.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0*/