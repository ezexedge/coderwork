const express = require('express')
const router = express.Router()
const homeController = require('../controllers/homeController')
const vacantesController = require('../controllers/vacantesController')
const usuariosController = require('../controllers/usuariosController')
const authController = require('../controllers/authController')
module.exports = () => {

    router.get('/', homeController.mostrarTrabajos)
//creo vacantes

//verifica si esta logeado cuando hago click en nueva vacante
    router.get('/vacantes/nueva',
    authController.verificarUsuario,
    vacantesController.formularioNuevaVacante)
    router.post('/vacantes/nueva',
    authController.verificarUsuario,
    vacantesController.validarVacante,
    vacantesController.agregarVacante)
    router.get('/vacantes/:url' , vacantesController.mostrarVacante)
    router.get('/vacantes/editar/:url',
    authController.verificarUsuario,
    vacantesController.formEditarVacante)
    router.post('/vacantes/editar/:url',
    authController.verificarUsuario,
    vacantesController.validarVacante,
    vacantesController.editarVacante)

//crear cuentas 
    router.get('/crear-cuenta' , usuariosController.formCrearCuenta)

    router.post('/crear-cuenta' , 
    usuariosController.validarRegistro ,
    usuariosController.crearUsuario)
//autentificar usuarios

    router.get('/iniciar-sesion', usuariosController.formIniciarSesion)
    router.post('/iniciar-sesion', authController.autenticarUsuario)
//cerrar-sesion
    router.get('/cerrar-sesion',
    authController.autenticarUsuario,
    authController.cerrarSesion
    )
    //panel de administracion 

    router.get('/administracion' ,
    authController.verificarUsuario,
    authController.mostrarPanel)
//editar perfil

    router.get('/editar-perfil',
    authController.verificarUsuario,
    usuariosController.formEditarPerfil
    )

    router.post('/editar-perfil',
    authController.verificarUsuario,
    //usuariosController.validarPerfil,
    usuariosController.subirImagen,
    usuariosController.editarPerfil
    )

    //elimiar una vacante

    router.delete('/vacantes/eliminar/:id', 
        vacantesController.eliminarVacante
    )

    router.post('/vacantes/:url',
    vacantesController.subirCV,
    vacantesController.contactar
    )

    router.get('/candidatos/:id',
    authController.verificarUsuario,
    vacantesController.mostrarCandidatos
    )

    router.get('/reestablecer-password',
        authController.formReestablecerPassword
    )
    router.post('/reestablecer-password',
    authController.enviarToken
)

router.get('/reestablecer-password/:token',
authController.reestablecerPassword
)
router.post('/reestablecer-password/:token',
authController.guardarPassword
)
//buscador de vacante

router.post('/buscador', vacantesController.buscarVacantes)


    return router
}