
const checkAuth = (req, res, next) => {
    console.log('Session:', req.session); // Muestra la sesión
    

    if (req.session.userId) {
        next();
    } else {
        return res.status(401).json({ message: 'No estás autenticado' });
    }
};
 
module.exports = checkAuth;
