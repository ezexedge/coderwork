const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');
const multer = require('multer');
const shortid = require('shortid');

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande: Máximo 100kb ');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('/administracion');
            return;
        } else {
            return next();
        }
    });
}
// Opciones de Multer
const configuracionMulter = {
    limits : { fileSize : 100000 },
    storage: fileStorage = multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/perfiles');
        }, 
        filename : (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ) {
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
        } else {
            cb(new Error('Formato No Válido'));
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en devJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
    })
}



exports.validarRegistro = (req, res, next) => {

    // sanitizar
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirmar').escape();

    // validar
    req.checkBody('nombre', 'El Nombre es Obligatorio').notEmpty();
    req.checkBody('email', 'El email debe ser valido').isEmail();
    req.checkBody('password', 'El password no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'Confirmar password no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'El password es diferente').equals(req.body.password);

    const errores = req.validationErrors();

    if(errores){
        // si hay errores
        req.flash('error', errores.map(error => error.msg));

        res.render('crear-cuenta', {
            nombrePagina: 'Crea tu cuenta en devJobs',
            tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',mensajes: req.flash()
        });
        return;
    }

    // Si toda la validación es correcta
    next();
}

exports.crearUsuario = async (req, res, next) => {
    // crear el usuario
    const usuario = new Usuarios(req.body);
    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }
}

// formulario para iniciar sesión
exports.formIniciarSesion = (req, res ) => {
    res.render('iniciar-sesion', {
        nombrePagina : 'Iniciar Sesión devJobs'
    })
}

// Form editar el Perfil
exports.formEditarPerfil = (req, res) => {
    res.render('editar-perfil', {
        nombrePagina : 'Edita tu perfil en devJobs',
        usuario: req.user,
        cerrarSesion: true,
        nombre : req.user.nombre,
        imagen : req.user.imagen
    })
}
// Guardar cambios editar perfil
exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if(req.body.password) {
        usuario.password = req.body.password
    }

    if(req.file) {
        usuario.imagen = req.file.filename;
    }

    await usuario.save();

    req.flash('correcto', 'Cambios Guardados Correctamente');
    // redirect
    res.redirect('/administracion');
}

// sanitizar y validar el formulario de editar perfiles
exports.validarPerfil = (req, res, next) => {
    // sanitizar
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    if(req.body.password){
        req.sanitizeBody('password').escape();
    }
    // validar
    req.checkBody('nombre', 'El nombre no puede ir vacio').notEmpty();
    req.checkBody('email', 'El correo no puede ir vacio').notEmpty();

    const errores = req.validationErrors();

    if(errores) {
        req.flash('error', errores.map(error => error.msg));

        res.render('editar-perfil', {
            nombrePagina : 'Edita tu perfil en devJobs',
            usuario: req.user,
            cerrarSesion: true,
            nombre : req.user.nombre,
            imagen : req.user.imagen,
            mensajes : req.flash()
        })
    }
    next(); // todo bien, siguiente middleware!
}



/*
const mongoose = require('mongoose')
const Usuarios = mongoose.model('Usuarios')
const multer = require('multer')
const shortid = require('shortid')

exports.subirImagen = (req,res,next) => {
    upload(req,res,function(error){

        if(error){
            //ESTE IF HACE REFERENCIA A TODOS LOS ERRORES QUE TINEN ORIGEN A MULTER
            if(error instanceof multer.MulterError){
                //revisa si el error fue por parte de multer
              //EL EL COSOLE.LOG ME TIRA UN MULTERRROR 
                //console.log(error)
                if(error.code==='LIMIT_FILE_SIZE'){
                    req.flash('error','el archivo es muy grande : es grande max 1000')
                }else{
                    //accedemos a otros errores generado desde multerError
                    req.flash('error',error.message)
                }
            }else{
                req.flash('error',error.message)
            }
            //cuando tiene un error me lo muestra por flash de todas formas me
            //redirige a administracion
            //si no le pongo el return me imprime tambien el mensaje de correcto con el de error

            res.redirect('/administracion')
            return

        }else{
            //si no tiene errores sigue
            return next()
        }

       

        

    })

   
    }
    const configuracionMulter = {
        //donde guardo la imagen
        limits : {fileSize : 100000},
        storage: fileStorage = multer.diskStorage({
            destination : (req,file,cb) => {
                cb(null,__dirname+'../../public/uploads/perfiles')
            },
            //le generamos el nombre con el shortid para que todos los nombres de las imagenes sean  diferentes
            
            filename: (req,file,cb) => {
              const extension = file.mimetype.split('/')[1]
                cb(null,`${shortid.generate()}.${extension}`)
            }
        }),
        fileFilter(req,file,cb){
            if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ){
                cb(null,true)
            }
            else{
                cb(new Error('formato no valido'),false)
            }
        }
      
    }
    const upload = multer(configuracionMulter).single('imagen')


/*

exports.subirImagen = (req,res,next) => {
    upload(req,res,function(error){

        if(error instanceof multer.MulterError){
            return next()
        }

        

    })
    next()

    }

    const configuracionMulter = {
        //donde guardo la imagen
        storage: fileStorage = multer.diskStorage({
            destination : (req,file,cb) => {
                cb(null,__dirname+'../../public/uploads/perfiles')
            },
            //le generamos el nombre con el shortid para que todos los nombres de las imagenes sean  diferentes
            
            filename: (req,file,cb) => {
                const extension = file.mimetype.split('/')[1]
                cb(null,`${shortid.generate()}.${extension}`)
            }
        }),
        fileFilter(req,file,cb) {
            if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
                //cb funciona como un true o false
                cb(null,true)
            }
            else{
                cb(null,false)
            }
        },
        limits : {fileSize : 100000}
    }

    const upload = multer(configuracionMulter).single('imagen')

*/
/*
exports.formCrearCuenta = (req,res) => {
    res.render('crear-cuenta' , {
        nombre: 'crea una cuenta en devjobs',
        tagline: 'publica tus vacantes gratis'
    })
}



exports.validarRegistro = (req,res,next) => {

    req.sanitizeBody('nombre').escape()
    req.sanitizeBody('email').escape()
    req.sanitizeBody('password').escape()
    req.sanitizeBody('confirmar').escape()



    console.log(req.body)

    //notempty controla que los campos no esten vacios
    req.checkBody('nombre' , 'el nombre es obligatorio').notEmpty()
    req.checkBody('email' , 'email debe ser valido').isEmail()
    req.checkBody('password' , 'el password es obligatorio').notEmpty()
    req.checkBody('confirmar' , 'el confirmar es obligatorio').notEmpty()
    req.checkBody('confirmar' , 'el password es diferente').equals(req.body.password)




    const errores = req.validationErrors()
    
    if(errores){
        //console.log(errores) nos tira errores y tira mensajes en msg
        req.flash('error', errores.map(error => error.msg ))
       
        res.render('crear-cuenta' , {
            nombrePagina: 'crea tu cuenta',
            tagline : 'publica tus vacante gratis',
            mensajes: req.flash()
        })

        return
    }

    next()
}

exports.crearUsuario =  async (req,res,next) => {

    const usuario = new Usuarios(req.body)

    try{
        await usuario.save()
        res.redirect('/iniciar-sesion')
    }catch(error){
        console.log(error)
        req.flash('error',error)
        res.redirect('/crear-cuenta')

    }

}

exports.formIniciarSesion = (req,res) =>{
    res.render('iniciar-sesion' , {
        nombrePagina: 'iniciar sesion'
    })
}

exports.formEditarPerfil = (req,res) => {
    res.render('editar-perfil' , {
        nombrePagina: 'editar el perfil',
        usuario: req.user,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen : req.user.imagen
    })
}

exports.editarPerfil  = async (req,res)=> {
    const usuario = await Usuarios.findById(req.user._id)
    usuario.nombre = req.body.nombre
    usuario.email = req.body.email
    if(req.body.password){
        usuario.password = req.body.password
    }
    if(req.file){
        usuario.imagen = req.file.filename
    }
  
    await usuario.save()
    req.flash('correcto', 'cambios guardados')
    res.redirect('/administracion')
}

//validar y sanitizar perfil 
exports.validarPerfil = (req,res,next) =>{
//sanitiizar
    req.sanitizeBody('nombre').escape()
    req.sanitizeBody('email').escape()
    if(req.body.password){
        req.sanitizeBody('password').escape()
    }

    req.checkBody('nombre' , 'el campo no puede ir vacio').notEmpty()
    req.checkBody('email' , 'el campo no puede ir vacio').notEmpty()

    const errores = req.validationErrors()

    if(errores) {
        req.flash('error', errores.map(error=>error.msg))
        res.render('editar-perfil' , {
            nombrePagina: 'editar el perfil',
            usuario: req.user,
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        })

    }

}

*/