const emailConfig = require('../config/email')
const hbs = require('nodemailer-express-handlebars')
const nodemailer = require('nodemailer')
const util = require('util')

let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
  auth:  {
    user: emailConfig.user,
    pass: emailConfig.pass
    }
})
//usamos templte de handlears

transport.use(
    'compile',
    hbs({
      viewEngine: {
        extName: 'handlebars',
        partialsDir: __dirname + '/../views/emails',
        layoutsDir: __dirname + '/../views/emails',
        defaultLayout: 'reset.handlebars'
      },
      viewPath: __dirname + '/../views/emails',
      extName: '.handlebars'
    })
  );


exports.enviar = async(opciones) => {

    const opcionesEmail = {

        from : 'ezequiel <ezeedge@gmail.com',
        to :  opciones.usuario.email,
        subject: opciones.subject,
        template: opciones.archivo,
        context:{
            resetUrl : opciones.resetUrl
        }

    }
    const sendMail = util.promisify(transport.sendMail,transport)
    return sendMail.call(transport,opcionesEmail)

    //el await de este async lo pongo cuando lo invoco en authcontrooler
 
}