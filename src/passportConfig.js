const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UsuarioModel = require('../src/models/Usuario.js'); // Asegúrate de ajustar el path según tu estructura

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:9000/auth/google/callback" // Ajusta el puerto si es necesario
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Verifica si el usuario ya existe
      let user = await UsuarioModel.findOne({ googleId: profile.id });

      if (!user) {
        // Crea un nuevo usuario si no existe
        user = new UsuarioModel({
          googleId: profile.id,
          nombre: profile.displayName,
          email: profile.emails[0].value,
          tipo_usuario:"cliente",
          status_cuenta:"Activo"
          // Puedes agregar más datos si el modelo tiene más campos
        });
        await user.save();
      }

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
));

// Serialización y deserialización de usuario
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await UsuarioModel.findById(id);
  done(null, user);
});

module.exports = passport;
