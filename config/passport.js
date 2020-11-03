const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const Usuarios = mongoose.model('Usuarios')

passport.use(new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email,password,done)=>{
    const usuario = await Usuarios.findOne({email})
    if(!usuario )return done(null,false, {
        message: 'usuario no existente'
    })
//comparar password lo hicimos en el model usuario
    const verificarPass = usuario.compararPassword(password)
    if(!verificarPass)return done(null,false,{
        message: 'usuario no existe'
    })

    //el usuario existe y el password es correcto
    return done(null,usuario)
}))

passport.serializeUser((usuario,done)=> done(null,usuario._id))
passport.deserializeUser(async(id,done)=>{
    const usuario = await Usuarios.findById(id).exec()
    return done(null,usuario)
})


module.exports = passport