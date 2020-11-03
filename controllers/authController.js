const passport = require('passport')
const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante')
const Usuarios =  mongoose.model('Usuarios')
const crypto = require('crypto')
const enviarEmail = require('../handlers/email')
exports.autenticarUsuario = passport.authenticate('local' , {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'ambos campos son obligatorios'
})

exports.verificarUsuario = (req,res,next) =>{
    //isAutenticatd es un metodo de passport propio
    if(req.isAuthenticated()){
        return next()
    }

    res.redirect('/iniciar-sesion')
}

exports.mostrarPanel = async (req, res) => {

    // consultar el usuario autenticado
    const vacantes = await Vacante.find({ autor: req.user._id });
    
    res.render('administracion', {
        nombrePagina: 'Panel de Administración',
        tagline: 'Crea y Administra tus vacantes desde aquí',
        cerrarSesion: true,
        nombre : req.user.nombre,
        imagen : req.user.imagen,
        vacantes
    })
}

exports.cerrarSesion =  (req,res) => {
    req.logout()
    req.flash('correcto' , 'cerraste sesion')
    return res.redirect('/iniciar-sesion')
}

exports.formReestablecerPassword = (req,res)=>{
    res.render('reestablecer-password',{
        nombrePagina: 'Reestablecer password',
        tagline: 'si olvidate tu password de tu cuenta , pone tu email'
    })
}

exports.enviarToken = async (req , res) => {
    //buscamos el email 
const usuario = await Usuarios.findOne({email: req.body.email})

if(!usuario){
    req.flash('error' , 'ese email no existe en la base de datos')
    return res.redirect('/iniciar-sesion')
}
//el usuario existe  entonces generamos el token

usuario.token = crypto.randomBytes(20).toString('hex')
usuario.expira = Date.now() + 3600000


await usuario.save()

const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`

await enviarEmail.enviar({
    usuario,
    subject: 'password reset',
    resetUrl,
    archivo: 'reset'
})

req.flash('correcto' , 'revisa tu email y revisa las indicaciones')
res.redirect('/iniciar-sesion')



}
//valida si el token es valido
exports.reestablecerPassword = async(req,res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token
    })

    if(!usuario){
        req.flash('error', 'el formulario ya no es valido')
        return res.redirect('/reestablecer-password')
    }
    
    res.render('nuevo-password',{
        nombrePagina: 'modificar tu password',

    })

}
//almacena el nuevo password en DB
exports.guardarPassword = async(req,res) => {
const usuario  = await Usuarios.findOne({
    token: req.params.token
})

if(!usuario){
    req.flash('error', 'el formulario ya no es valido')
    return res.redirect('/reestablecer-password')
}
//asigno password y limpio valores previos
usuario.password = req.body.password
usuario.token = undefined
usuario.expira = undefined

//almaceno el nuevo objeto

await usuario.save()
req.flash('correcto', 'password modificado')
res.redirect('/iniciar-sesion')
}