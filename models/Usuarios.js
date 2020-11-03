const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const bcrypt = require('bcrypt')

const usuarioSchema = new mongoose.Schema({
    email : {

        type: String,
        unique: true,
        lowercase : true,
        trim:true
        
    },
    nombre: {

        type: String,
        required : true

    },
    password : {

        type: String,
        required: true,
        trim: true

    },
    token: String,
    expira: Date,
    imagen: String
})

//hasheamos el password

usuarioSchema.pre('save', async function(next){
    //isModified es una funcion de mongoose
    //si password esta hasheado
    if(!this.isModified('password')){
        return next()
    }
    // si no esta hasheado
    const hash = await bcrypt.hash(this.password,10)
    this.password = hash
})

  //aca lo configuro para que me cambie el mensaje y evitar que me de el mensaje en ingles
    //asi cuando uso flash uso el mensaje que yo configure y no uso el mensaje en ingles 
usuarioSchema.post('save',function(error,doc,next){
        if(error.name === 'MongoError' && error.code === 1100){
        next('ese correo  esta registrado ')
    }
    else{
        next(error)
    }
})
//autenticar usuarios
usuarioSchema.methods = {
    compararPassword : function(password){
        //comparo el password que ingreso en el input con el password ya almacenado yreturna true o false

        return bcrypt.compareSync(password, this.password)
    }
}

module.exports = mongoose.model('Usuarios' , usuarioSchema)