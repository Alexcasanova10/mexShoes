const User = require('../models/Usuario.js')  // Asegúrate de que este modelo esté funcionando correctamente

// Middleware para verificar autenticación y rol
function checkAuthAndRole(req, res, next) {
    // Verifica si el usuario está autenticado
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            message: 'No estás autenticado. Redirigiendo a login.',
            redirectTo: '/login'
        });
    }

    // Aquí asumimos que `req.user` está configurado después de autenticación
    const role = req.user ? req.user.tipo_usuario : null;

    if (!role) {
        return res.status(403).json({ message: 'No se pudo determinar el rol del usuario.' });
    }

    // Verifica el rol y la ruta a la que accede
    if (role === 'admin' && req.originalUrl.startsWith('/dashboard')) {
        return next(); // Si es admin y accede a /dashboard
    } else if (role === 'cliente' && req.originalUrl.startsWith('/perfil')) {
        return next(); // Si es cliente y accede a /perfil
    } else {
        // Si el rol no coincide con la ruta que intenta acceder
        return res.status(403).json({ message: 'No tienes permisos para acceder a esta ruta.' });
    }
}

module.exports = checkAuthAndRole;
