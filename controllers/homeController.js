const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

exports.mostrarTrabajos = async (req, res, next) => {

    const vacantes = await Vacante.find();

    if(!vacantes) return next();

    res.render('home', {
        nombrePagina : 'Encuentra y Pública Trabajos para Desarrolladores Web',
        tagline: 'Encuentra y Pública Trabajos para Desarrolladores Web',
        barra: true,
        boton: true,
        vacantes
    })
}
/*
const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante')


exports.mostrarTrabajos = async (req,res) => {
//monstramos en la pagina web home todo lo que esta en la base de datos

    const vacantes = await Vacante.find()

    //si no hay vacante usamos next
    if(!vacantes)return next()

    res.render('home', {
        nombrePagina: 'desde home',
        tagline: 'publica y encuentra trabajo',
        barra: true ,
        boton: true,
        vacantes
    })
}

*/