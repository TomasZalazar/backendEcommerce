// 
import passport from 'passport';
import local from 'passport-local';
import GitHubStrategy from 'passport-github2';
import GoogleStrategy from 'passport-google-oauth20'
import jwt from 'passport-jwt'

// routes
import  config  from '../config.js';
import UsersManager from '../models/dao/userManager.mdb.js';
import { createHash, isValidPassword } from '../services/utils.js';
import userModel from '../models/users.model.js';
import CartModel from '../models/carts.model.js';


const localStrategy = local.Strategy;
const jwtStrategy = jwt.Strategy
const jwtExtractor = jwt.ExtractJwt
const manager = new UsersManager(userModel);


const cookieExtractor = (req) => {
    let token = null
    if (req && req.cookies) token = req.cookies[`${config.APP_NAME}_cookie`]
    return token
}
const initAuthStrategies = () => {
    passport.use('register', new localStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
            const { firstName, lastName } = req.body;
    
            try {
               
                const foundUser = await userModel.findOne({ email: username });
                if (foundUser) {
                    return done(null, false, { message: 'El usuario ya existe' });
                }

                const newCart = new CartModel();
                const savedCart = await newCart.save();
                const hashedPassword = createHash(password);
                const newUser = new userModel({
                    email: username,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    role: 'user',
                    _cart_id: savedCart._id // Asociar el ID del carrito al usuario
                });
    
                const createdUser = await newUser.save();
                return done(null, createdUser);
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.use('login', new localStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, email, password, done) => {
            try {
                const foundUser = await userModel.findOne({ email });

                if (foundUser && isValidPassword(password, foundUser.password)) {
                    const { password, ...filteredFoundUser } = foundUser.toObject();
                    return done(null, filteredFoundUser);
                } else {
                    return done(null, false);
                }
            } catch (err) {
                return done(err, false);
            }
        }
    ));
    // Estrategia de inicio de sesión con Google
    passport.use('googlelogin', new GoogleStrategy(
        {
            clientID: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            callbackURL: config.GOOGLE_CALLBACK_URL || 'https://localhost:4000/api/auth/googlecallback',
            
            scope: ['profile', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile._json?.email || null;
                if (!email) {
                    return done(new Error('Faltan datos de perfil'), null);
                }

                let foundUser = await userModel.findOne({ email });

                if (!foundUser) {
                    const newCart = new CartModel();
                    const savedCart = await newCart.save();

                    const newUser = new userModel({
                        email,
                        firstName: profile._json.given_name,
                        lastName: profile._json.family_name,
                        role: 'user',
                        _cart_id: savedCart._id,
                        password: 'none'
                    });

                    foundUser = await newUser.save();
                }

                return done(null, foundUser);
            } catch (err) {
                return done(err, false);
            }
        }
    ));


    passport.use('ghlogin', new GitHubStrategy(
        {
            clientID: config.GITHUB_CLIENT_ID,
            clientSecret: config.GITHUB_CLIENT_SECRET,
            callbackURL: config.GITHUB_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile._json?.email || null;
                if (!email) {
                    return done(new Error('Faltan datos de perfil'), null);
                }
    
                let foundUser = await userModel.findOne({ email });
    
                if (!foundUser) {
                    const newCart = new CartModel();
                    const savedCart = await newCart.save();
    
                    const newUser = new userModel({
                        email,
                        firstName: profile._json.name.split(' ')[0],
                        lastName: profile._json.name.split(' ')[1],
                        role: 'user',
                        _cart_id: savedCart._id,
                        password: 'none'
                    });
    
                    foundUser = await newUser.save();
                }
    
                return done(null, foundUser);
            } catch (err) {
                return done(err, false);
            }
        }
    ));
    
    // Estrategia para verificación de token vía cookie
    passport.use('current', new jwtStrategy(
        {
            // Aquí llamamos al extractor de cookie
            jwtFromRequest: jwtExtractor.fromExtractors([cookieExtractor]),
            secretOrKey: config.SECRET
        },
        async (jwt_payload, done) => {
            try {
                return done(null, jwt_payload);
            } catch (err) {
                return done(err);
            }
        }
    ));

    // Estrategia para verificación de token vía cookie
    passport.use('jwtlogin', new jwtStrategy(
        {
            // Aquí llamamos al extractor de cookie
            jwtFromRequest: jwtExtractor.fromExtractors([cookieExtractor]),
            secretOrKey: config.SECRET
        },
        async (jwt_payload, done) => {
            try {
                return done(null, jwt_payload);
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        const userId = user._id || user.payload?._id;
        if (userId) {
            done(null, userId);
        } else {
            done(new Error('user id no encontrado'), null);
        }
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userModel.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
}

export const passportCall = strategy => {
    return async (req, res, next) => {
        passport.authenticate(strategy, { session: false }, function (err, user, info) {
            if (err) return next(err);
            // if (!user) return res.status(401).send({ origin: config.SERVER, payload: null, error: info.messages ? info.messages : info.toString() });
            if (!user) return res.status(401).send({ origin: config.SERVER, payload: null, error: 'Usuario no autenticado' });

            req.user = user;
            next();
        })(req, res, next);
    }
};
export default initAuthStrategies;
