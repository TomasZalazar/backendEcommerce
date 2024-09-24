import { Router } from 'express';
import config from '../config.js';
import { verifyAuthorization } from '../services/adminAuth.js';
import { createHash, verifyRequiredBody, createToken, verifyToken } from '../services/utils.js';

import passport from 'passport';
import { passportCall } from '../auth/passport.strategies.js';
import moment from 'moment';
import UserManager from '../models/dao/userManager.mdb.js';
import userModel from '../models/users.model.js'
import { sendWelcomeEmail } from '../services/emailService.js';

const userManager = new UserManager(userModel);

const auth = Router();


auth.get('/hash/:password', async (req, res) => {
    res.status(200).send({ origin: config.SERVER, payload: createHash(req.params.password) });
});

auth.post('/register', verifyRequiredBody(['firstName', 'lastName', 'email', 'password']),
    passport.authenticate('register', { session: false }),async (req, res) => {
        if (!req.user) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }
         // Enviar correo de bienvenida
        
         await sendWelcomeEmail(req.user.email, req.user.firstName);
        
        res.redirect('/login');
    }
);
auth.post('/login', verifyRequiredBody(['email', 'password']),
    passport.authenticate('login', { session: false }), (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuario o clave no válidos' });
        }

        res.status(200).json({ message: 'Inicio de sesión exitoso', user: req.user });
    }
);
// Ruta de login con Passport
auth.post('/pplogin', verifyRequiredBody(['email', 'password']),
    passport.authenticate('login', { failureRedirect: `/login?error=${encodeURI('Usuario o clave no válidos')}` }),
    async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).send({ origin: config.SERVER, payload: 'Autenticación fallida' });
            }

            req.session.user = req.user;
            req.session.save(err => {
                if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });

                res.redirect('/realtimeproducts');
            });
        } catch (err) {
            res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
        }
    });
// Ruta para iniciar el flujo de autenticación con Google
auth.get('/googlelogin',
    passport.authenticate('googlelogin', { scope: ['profile', 'email'] })
);

// Ruta para manejar la respuesta de Google después de la autenticación
auth.get('/googlecallback',
    passport.authenticate('googlelogin', { failureRedirect: '/login?error=Error+al+identificar+con+Google' }),
    async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
  
        const payload = req.user._doc; 

        try {
            const token = createToken(payload, '1h');
            res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 60 * 60 * 1000, httpOnly: true });

            const formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
            const result = await userManager.update(req.user._id, { last_connection: formattedDate });

            if (result.status !== 200) {
                return res.status(result.status).json({ error: result.error });
            }

            res.redirect('/home');
        } catch (error) {
            res.status(500).json({ error: 'Error al procesar la solicitud de inicio de sesión', details: error.message });
        }
    }
);

auth.get('/ghlogin',
    passport.authenticate('ghlogin', { scope: ['user'] }), async (req, res) => {
    });

auth.get('/ghlogincallback',
    passport.authenticate('ghlogin', { failureRedirect: '/login?error=Error+al+identificar+con+Github' }),
    async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        const payload = req.user._doc; 
        console.log('Payload para el token:', payload);

        try {
            const token = createToken(payload, '1h');
            res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 60 * 60 * 1000, httpOnly: true });

            const formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
            const result = await userManager.update(req.user._id, { last_connection: formattedDate });

            if (result.status !== 200) {
                return res.status(result.status).json({ error: result.error });
            }

            res.redirect('/home')
        } catch (error) {
            res.status(500).json({ error: 'Error al procesar la solicitud de inicio de sesión', details: error.message });
        }
    }
);




auth.post('/jwtlogin', verifyRequiredBody(['email', 'password']), passport.authenticate('login', { session: false }), async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Usuario o clave no válidos' });
    }

    try {
        // Crear el token
        const token = createToken(req.user, '1h');
        res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 60 * 60 * 1000, httpOnly: true });


        const formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const result = await userManager.update(req.user._id, { last_connection: formattedDate });

        if (result.status !== 200) {
            return res.status(result.status).json({ error: result.error });
        }


        res.status(200).json({ message: 'Inicio de sesión exitoso', redirect: '/home' });
    } catch (error) {
        return res.status(500).json({ error: 'Error al procesar la solicitud de inicio de sesión' });
    }
});


auth.get('/current',
    passportCall('current'), // Utiliza passportCall en lugar de verifyToken
    async (req, res) => {
        try {
            // Aquí req.user ya debe contener los datos del usuario autenticado
            const currentToken = req.user;
            const { password, role, _id, ...filteredCurrent } = currentToken;
            res.status(200).send({ payload: filteredCurrent });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }
);
// auth.get('/current', passport.authenticate('current', { failureRedirect: `/current?error=${encodeURI('No hay un token registrado')}`}), async (req, res) => {
//     try {
//         const currentToken = req.user // Asumiendo que req.user ya contiene los datos que quieres enviar
//         const { password, role, _id, ...filteredCurrent } = currentToken;
//         res.status(200).send({ payload: filteredCurrent });
//     } catch (error) {
//         res.status(500).send({ error: error.message });
//     }
// });

auth.get('/private', verifyToken, verifyAuthorization('admin'), async (req, res) => {
    try {
        res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido ADMIN!' });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, error: err.message });
    }
});
auth.get('/ppadmin', passportCall('jwtlogin'), verifyAuthorization('admin'), async (req, res) => {
    try {
        res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido ADMIN!' });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

// Logout endpoint para manejar tanto sesiones como JWT
auth.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al ejecutar logout' });
        }
        res.clearCookie(`${config.APP_NAME}_cookie`);
        res.redirect('/login')
    });
});

export default auth;
