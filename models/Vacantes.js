const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const slug = require('slug')
//slug me genera las url
const shortid = require('shortid')
//crea un id unico para cada uno

const vacantesSchema = new mongoose.Schema({
    titulo : {
        type : String,
        require: 'nombre obligatorio',
        trim: true
    },
    empresa : {
        type : String,
        trim: true
    },
    ubicacion : {
        type : String,
        require: 'ubicacion obligatoria',
        trim: true
    },
    salario : {
        type : String , 
        default :  0,
        trim: true
    },
    contrato: {
        type: String,
        trim: true
    } ,
     descripcion: {
        type: String,
        trim: true
    },
    url : {
        type: String ,
        lowercase : true
    },
    skills : [String],
    candidatos :  [{
        nombre : String ,
        email : String ,
        cv : String
    }],
    autor: {
        //hago referencia al otro modelo
        type: mongoose.Schema.ObjectId,
        ref: 'Usuarios',
        required: 'el autor es obligatorio'
    }
})
//antes de guardar hace una operacion
//dentro de estouso slug y shortid
vacantesSchema.pre('save' , function(next){
    const url = slug(this.titulo)
    this.url = `${url}-${shortid.generate()}`

    next()
})
//creamos los indicides para la busqueda

vacantesSchema.index({titulo: 'text'})

module.exports = mongoose.model('Vacante' , vacantesSchema)
