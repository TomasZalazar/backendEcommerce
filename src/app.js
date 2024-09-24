// dependencias
import express from 'express'
import cookieParser from 'cookie-parser'
import exphbs from 'express-handlebars'
import session from 'express-session'
import passport from 'passport'
import MongoStore from 'connect-mongo'
import cors from 'cors'
import bodyParser from 'body-parser'

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
import protectedRoutes from './routes/recover.routes.js'
import uploadRouter from './routes/upload.routes.js'

import { addLogger, logHttpRequests } from './services/logger.js'
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const expressInstance = app.listen(config.PORT, async () => {
    MongoSingleton.getInstance()


    //socket
    const socketServer = initSocket(expressInstance);
    app.set('socketServer', socketServer);

    //configuracion del server
    // app.use(logger('dev'))
    app.disable('x-powered-by')
    // app.use(express.json());
    // app.use(express.urlencoded({ extended: true }));
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


    // Configura Handlebars como motor de plantillas
const handlebars = exphbs.create({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true, // Permitir acceso a propiedades del prototipo
    },
});
    app.engine('handlebars', handlebars.engine);
    app.set('views', `${config.DIRNAME}/views`);
    app.set('view engine', 'handlebars');
    // Habilita CORS
    app.use(cors({
        origin: '*', 
        credentials: true 
    }));

    app.use(addLogger)
    app.use(logHttpRequests)
    app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));
    
    // endpoints
    app.use('/api/products', productsRoutes)
    app.use('/api/users', usersRoutes)
    app.use('/api/cart', cartRoutes)
    app.use('/api/auth', authRoutes)
    app.use('/api/recover', protectedRoutes);
    app.use('/upload', uploadRouter);
    
    
    app.use('/static', express.static(`${config.DIRNAME}/public`))
    
    // views    
    app.use('/', viewsRoutes)
    
    app.use(errorsHandler);
    
}) 

const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentación sistema TODOTIENDA',
            description: 'Esta documentación cubre toda la API habilitada para TODOTIENDA',
        },
    },
    apis: ['./src/docs/**/*.yaml'], // todos los archivos de configuración de rutas estarán aquí
    // apis: ['./src/docs/**/documentacion.2.1.0.yaml'], // archivo yaml en especifico
};
const specs = swaggerJsdoc(swaggerOptions);

export default app;