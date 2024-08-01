// dependencias
import express from 'express'
import mongoose from 'mongoose'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import handlebars from 'express-handlebars'
import session from 'express-session'
import passport from 'passport'
import MongoStore from 'connect-mongo'
import cors from 'cors'

// routes

import config from './config.js'
import productsRoutes from './routes/products.routes.js'
import usersRoutes from './routes/users.routes.js'
import cartRoutes from './routes/carts.routes.js'
import viewsRoutes from './routes/views.routes.js'
import initAuthStrategies from './auth/passport.strategies.js'
import authRoutes from './routes/auth.routes.js'
import initSocket from './services/initSocket.js'
import MongoSingleton from './services/mongo.singleton.js'
import errorsHandler from './services/errors.handler.js'
import cookieRouter from './routes/cookies.routes.js'
import protectedRoutes from './routes/protected.routes.js'

import { addLogger, logHttpRequests }  from './services/logger.js'
import CustomError from './services/CustomError.class.js'

const app = express()


const expressInstance = app.listen(config.PORT, async () => { 
    MongoSingleton.getInstance()

    
    //socket
    const socketServer = initSocket(expressInstance);
    app.set('socketServer', socketServer);

    //configuracion del server
    // app.use(logger('dev'))
    app.disable('x-powered-by')
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser(config.SECRET));
    
    //sessions
    app.use(session({
        // store: new fileStorage({ path: './sessions', ttl: 100, retries: 0 }),
        store: MongoStore.create({ mongoUrl: config.MONGODB_URI, ttl: 600 }),
        secret: config.SECRET,
        resave: false,
        saveUninitialized: false
    }));
     // inicializar Passport y sesiones de Passport
    initAuthStrategies();
    app.use(passport.initialize())
    app.use(passport.session())

    // motor plantilla config 
    app.engine('handlebars', handlebars.engine());
    app.set('views', `${config.DIRNAME}/views`);
    app.set('view engine', 'handlebars');
    // Habilita CORS
    app.use(cors({
        origin: '*'
    }));
    
    app.use(addLogger)
    app.use(logHttpRequests)
    app.get('/loggerTest', (req, res) => {
        try {
            req.logger.debug('Este es un mensaje de debug');
            req.logger.http('Este es un mensaje http');
            req.logger.info('Este es un mensaje info');
            req.logger.warn('Este es un mensaje warning');
            req.logger.error('Este es un mensaje error');
            req.logger.fatal('Este es un mensaje fatal');
        
            res.send('Prueba de logger realizada');
        } catch (error) {
            req.logger.error('Error en /loggerTest: ', error);
            res.status(500).send('Error en /loggerTest');
        }
    });
    app.get('/test-error', (req, res, next) => {
        // Probar con un código de error diferente
        const error = new CustomError({ code: 8, status: 404, message: 'error creado por mi' });
        next(error);
    });
    console.log(`Logger en modo: ${config.MODE}`);
    // endpoints
    app.use('/api/products', productsRoutes)
    app.use('/api/users', usersRoutes)
    app.use('/api/cart', cartRoutes)
    app.use('/api/auth', authRoutes)
    app.use('/api/cookies', cookieRouter);
    app.use('/api/protected', protectedRoutes);

    
    app.use('/static', express.static(`${config.DIRNAME}/public`))
     
     // views    
     app.use('/', viewsRoutes)
     
     app.use(errorsHandler);

}) 