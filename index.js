const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const path = require('path');
const router = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');

require('dotenv').config({ path : 'variables.env'});

const app = express();

// validación de campos
app.use(expressValidator());

// habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// habilitar handlebars como view

app.engine('handlebars',
    exphbs({
        handlebars: allowInsecurePrototypeAccess(handlebars),
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars')
    })
);

app.set('view engine', 'handlebars');

// static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection : mongoose.connection })
}));


// inicializar passport
app.use(passport.initialize());
app.use(passport.session());

// Alertas y flash messages
app.use(flash());

// Crear nuestro middleware
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
});

app.use('/', router());

// 404 pagina no existente


// Administración de los errores
app.use((error, req, res) => {
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error');
});


//app.listen(process.env.PUERTO);
const host = '0.0.0.0'
const port = process.env.PUERTO

app.listen(port , host , ()=> {
    console.log(`funciona todo ok puerto ${port}`)
})

/*
const mongoose = require('mongoose')
require('./config/db')

const express = require('express')
const router = require('./routes/index')
const exphbs = require('express-handlebars')
const path = require('path')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const passport = require('./config/passport')
const createError = require('http-errors')
//el paquete dotenv es para poder conectarlo con el archivo variables.env
require('dotenv').config({ path : 'variable.env'})
const app = express()


//habilitamos handlebars express

app.engine('handlebars', exphbs({
    helpers: require('./helpers/handlebars')
}));
app.set('view engine', 'handlebars');
//activo el bodyparser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
//habilitamos express validator
app.use(expressValidator())
//habilitamos la carpeta public
app.use(express.static(path.join(__dirname , 'public')))

app.use(cookieParser())
//configuramos nuestra sesion con  la key y secret que esta en env 
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore ({mongooseConnection: mongoose.connection})
}))

//habilitamos passport
app.use(passport.initialize())
app.use(passport.session())
//habilitamos flahs

app.use(flash())
//creamos midleware almacena mensajes y usuarios
app.use((req,res,next) => {
    res.locals.mensajes = req.flash()
    next()
})

app.use('/', router())

app.use((req,res,next)=>{

        next(createError(404,'no encontrado'))

})
//adminstramos los errores
app.use((error,req,res,next) => {
    res.locals.mensaje = error.message
    //si el rror no es 404 que sea error 500
    const status = error.status || 500
//console.log(status)
res.locals.status = status
//con esto le pasamos el valor del status a la pagina web
res.status(status)



    res.render('error')
})

const host = '0.0.0.0'
const port = process.env.PORT

app.listen(port , host , ()=> {
    console.log(`funciona todo ok puerto ${port}`)
})

//pepad

*/