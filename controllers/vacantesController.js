const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

const multer = require('multer');
const shortid = require('shortid');

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre : req.user.nombre,
        imagen : req.user.imagen
    })
}

// agrega las vacantes a la base de datos
exports.agregarVacante = async (req, res) => {
    const vacante = new Vacante(req.body);

    // usuario autor de la vacante
    vacante.autor = req.user._id;

    // crear arreglo de habilidades (skills)
    vacante.skills = req.body.skills.split(',');

    // almacenarlo en la base de datos
    const nuevaVacante = await vacante.save()

    // redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`);

}

// muestra una vacante
exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor');
    // si no hay resultados
    if(!vacante) return next();

    res.render('vacante', {
        vacante,
        nombrePagina : vacante.titulo,
        barra: true
    })
}

exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url});

    if(!vacante) return next();

    res.render('editar-vacante', {
        vacante,
        nombrePagina : `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre : req.user.nombre,
        imagen : req.user.imagen
    })
}

exports.editarVacante = async (req, res) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada, {
        new: true,
        runValidators: true
    } );

    res.redirect(`/vacantes/${vacante.url}`);
}

// Validar y Sanitizar los campos de las nuevas vacantes
exports.validarVacante = (req, res, next) => {
    // sanitizar los campos
    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('salario').escape();
    req.sanitizeBody('contrato').escape();
    req.sanitizeBody('skills').escape();

    // validar
    req.checkBody('titulo', 'Agrega un Titulo a la Vacante').notEmpty();
    req.checkBody('empresa', 'Agrega una Empresa').notEmpty();
    req.checkBody('ubicacion', 'Agrega una Ubicación').notEmpty();
    req.checkBody('contrato', 'Selecciona el Tipo de Contrato').notEmpty();
    req.checkBody('skills', 'Agrega al menos una habilidad').notEmpty();

    const errores = req.validationErrors();

    if(errores) {
        // Recargar la vista con los errores
        req.flash('error', errores.map(error => error.msg));

        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre : req.user.nombre,
            mensajes: req.flash()
        })
    }

    next(); // siguiente middleware
}

exports.eliminarVacante = async (req, res) => {
    const { id } = req.params;

    const vacante = await Vacante.findById(id);

    if(verificarAutor(vacante, req.user)){
        // Todo bien, si es el usuario, eliminar
        vacante.remove();
        res.status(200).send('Vacante Eliminada Correctamente');
    } else {
        // no permitido
        res.status(403).send('Error')
    }


    
}

const verificarAutor = (vacante = {}, usuario = {}) => {
    if(!vacante.autor.equals(usuario._id)) {
        return false
    } 
    return true;
}


// Subir archivos en PDF
exports.subirCV  =  (req, res, next) => {
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande: Máximo 100kb');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('back');
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
            cb(null, __dirname+'../../public/uploads/cv');
        },
        filename : (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'application/pdf' ) {
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
        } else {
            cb(new Error('Formato No Válido'));
        }
    }
}

const upload = multer(configuracionMulter).single('cv');

// almacenar los candidatos en la BD
exports.contactar = async (req, res, next) => {

    const vacante = await Vacante.findOne({ url : req.params.url});

    // sino existe la vacante
    if(!vacante) return next();

    // todo bien, construir el nuevo objeto
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv : req.file.filename
    }

    // almacenar la vacante
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    // mensaje flash y redireccion
    req.flash('correcto', 'Se envió tu Curriculum Correctamente');
    res.redirect('/');
}

exports.mostrarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id);

    if(vacante.autor != req.user._id.toString()){
        return next();
    } 

    if(!vacante) return next();

    res.render('candidatos', {
        nombrePagina : `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion : true,
        nombre : req.user.nombre,
        imagen : req.user.imagen,
        candidatos : vacante.candidatos 
    })
}

// Buscador de Vacantes
exports.buscarVacantes = async (req, res) => {
    const vacantes = await Vacante.find({
        $text : {
            $search : req.body.q
        }
    });

    // mostrar las vacantes
    res.render('home', {
        nombrePagina : `Resultados para la búsqueda : ${req.body.q}`, 
        barra: true,
        vacantes 
    })
}

/*  version vieja
const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante')
const multer = require('multer')
const shortid = require('shortid')

exports.formularioNuevaVacante = (req,res) => {
    res.render('nueva-vacante' , {
        nombrePagina : 'Nueva vacante',
        tagline : 'llena del formulario',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
} 

exports.agregarVacante = async (req,res)=>{
    //de esta forma se mapea automaticamente todos los campos 
   const vacante = new Vacante(req.body)
//le asignamos al autor Usuarios en vacantes
   vacante.autor = req.user._id

   vacante.skills = req.body.skills.split(',')



   const nuevaVacante = await vacante.save()

   res.redirect(`/vacantes/${nuevaVacante.url}`)

}

exports.mostrarVacante = async (req,res,next) =>{
    //busco al usuario por el url usando el paramatro
    const vacante = await Vacante.findOne({url: req.params.url}).populate('autor')
    //populate seria una forma de relacionar base de datos y nos trae toda la info del autor
    // que yo configure en el modelo vancantes integrando autores que pone el id del usuario que esta en la base datos en moogose


    if(!vacante)return next()
    res.render('vacante',{
            vacante,
            nombrePagina: vacante.titulo,
            barra: true
    })

}

exports.formEditarVacante = async (req,res,next) => {
    const vacante = await Vacante.findOne({url: req.params.url})
    if(!vacante)return next()
    res.render('editar-vacante',{
        vacante,
        nombrePagina: `editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
    })
}

exports.editarVacante = async (req,res,next) => {

    const vacanteActualizada = req.body
    vacanteActualizada.skills = req.body.skills.split(',')
    const vacante = await Vacante.findOneAndUpdate({url: req.params.url} , vacanteActualizada,{
        new: true, //nos trae 
        runValidators: true //para que tome todo lo que pusismos



    })

    res.redirect(`/vacantes/${vacante.url}`)

}

//validar y santiar los campos de la nueva vacante

exports.validarVacante= (req,res,next) =>{

    req.sanitizeBody('titulo').escape()
    req.sanitizeBody('empresa').escape()
    req.sanitizeBody('ubicacion').escape()
    req.sanitizeBody('salario').escape()
    req.sanitizeBody('contrato').escape()
    req.sanitizeBody('skills').escape()

    req.checkBody('titulo' , 'agrega un titulo').notEmpty()
    req.checkBody('empresa' , 'agrega una empresa').notEmpty()
    req.checkBody('ubicacion' , 'agrega una ubicacion').notEmpty()
    req.checkBody('salario' , 'agrega un salario').notEmpty()
    req.checkBody('contrato' , 'agrega un contrato').notEmpty()
    req.checkBody('skills' , 'agrega una habilidad').notEmpty()


    const errores = req.validationErrors()


    if(errores){

        req.flash('error', errores.map(error=> error.msg))
            res.render('nueva-vacante' , {
                nombrePagina : 'Nueva vacante',
                tagline : 'llena del formulario',
                cerrarSesion: true,
                nombre: req.user.nombre,
                mensajes: req.flash()
            })
        

    }


    next()

}

exports.eliminarVacante = async (req,res) => {
    const {id} = req.params
    const vacante = await Vacante.findById(id)
    
    if(verificarAutor(vacante,req.user)){
        vacante.remove()
        res.status(200).send('eliminado correctamente')

    }
    else{
        res.status(403).send('error')

    }

}

const verificarAutor = (vacante = {},usuario = {}) =>{
if(!vacante.autor.equals(usuario._id)){
    return false
}
return true
}

exports.subirCV   = (req,res,next) => {
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

            res.redirect('back')
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
                cb(null,__dirname+'../../public/uploads/cv')
            },
            //le generamos el nombre con el shortid para que todos los nombres de las imagenes sean  diferentes
            
            filename: (req,file,cb) => {
              const extension = file.mimetype.split('/')[1]
                cb(null,`${shortid.generate()}.${extension}`)
            }
        }),
        fileFilter(req,file,cb){
            if(file.mimetype === 'application/pdf'  ){
                cb(null,true)
            }
            else{
                cb(new Error('formato no valido'),false)
            }
        }
      
    }
    const upload = multer(configuracionMulter).single('cv')
//single hace referencia al name input

exports.contactar = async (req,res,next) => {
    const vacante = await Vacante.findOne({url:req.params.url})
    if(!vacante)return next()
//construimos el nuevo objeto
    const nuevoCandidato = {
        nombre : req.body.nombre,
        email: req.body.email,
        //lo ponemos de esta forma por que lo genera mulder
        cv : req.file.filename
    }
    //almacenamos en la base de datos

    vacante.candidatos.push(nuevoCandidato)
    await vacante.save()
    //enviamos mensaje con flash y luego lo redirijo al inicio 
    req.flash('correcto' , 'se envio el cv correctamente')
    res.redirect('/')

}

exports.mostrarCandidatos = async (req,res,next) => {
//buscamos por el id que tiene la vacante en la base de datos
    const vacante = await Vacante.findById(req.params.id)
    //usamos esta forma para verificar que sea el usuario y a req.user lo parseamos sino  no lo da como valido
   // if(vacante.autor == req.user._id.toString())

   if(vacante.autor != req.user._id.toString()){
       return next()
   }

   if(!vacante)return next()

   res.render('candidatos',{
       nombrePagina: `candidato - ${vacante.candidato}`,
       cerrarSesion: true,
       nombre: req.user.nombre,
       imagen: req.user.imagen,
       candidatos: vacante.candidatos

   })

}

exports.buscarVacantes = async (req,res)=>{

    const vacantes = await Vacante.find({
        $text : {
            $search : req.body.q
        }
    })

    res.render('home' , {
        nombrePagina: `resultado para la busqueda  : ${req.body.q}`,
        barra: true,
        vacantes
    })

}

*/