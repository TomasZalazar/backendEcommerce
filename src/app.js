import express from 'express'
import config from './config.js'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import handlebars from 'express-handlebars'

// routes

import productsRoutes from './routes/products.routes.js'
import mongoose from 'mongoose'

const app = express()


const expressInstance = app.listen(config.PORT, async () => {
    await mongoose.connect(config.MONGODB_URI)
    console.log(`Server on : http://localhost:${config.PORT} 
        bbdd on `)
    console.log(config.DIRNAME);

    //configuracion del server
    app.use(logger('dev'))
    app.disable('x-powered-by')
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser(config.SECRET));



    // //sessions
    // app.use(session({
    //     // store: new fileStorage({ path: './sessions', ttl: 100, retries: 0 }),
    //     store: MongoStore.create({ mongoUrl: config.MONGODB_URI, ttl: 600 }),
    //     secret: config.SECRET,
    //     resave: false,
    //     saveUninitialized: true
    // }));

    // // inicializar Passport y sesiones de Passport
    // initAuthStrategies();
    // app.use(passport.initialize())
    // app.use(passport.session())

    // motor plantilla config 
    app.engine('handlebars', handlebars.engine());
    app.set('views', `${config.DIRNAME}/views`);
    app.set('view engine', 'handlebars');


    app.use('/api/db/products', productsRoutes)
    app.use('/static', express.static(`${config.DIRNAME}/public`))

    // views    
    // app.use('/', viewsRoutes)
})