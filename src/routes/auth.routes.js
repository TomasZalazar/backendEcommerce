import { Router } from 'express';
import config from '../config.js';
import { adminAuth, verifyAuthorization } from '../services/adminAuth.js';
import { createHash, verifyRequiredBody, createToken, verifyToken } from '../services/utils.js';

import passport from 'passport';
import { passportCall } from '../auth/passport.strategies.js';

const router = Router();


router.get('/hash/:password', async (req, res) => {
    res.status(200).send({ origin: config.SERVER, payload: createHash(req.params.password) });
});

router.post('/register', verifyRequiredBody(['firstName', 'lastName', 'email', 'password']),
    passport.authenticate('register', { session: false }), (req, res) => {
        if (!req.user) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }
        res.status(201).json({ message: 'Usuario registrado exitosamente', user: req.user });
    }
);
router.post('/login', verifyRequiredBody(['email', 'password']),
    passport.authenticate('login', { session: false }), (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuario o clave no válidos' });
        }
        
        res.status(200).json({ message: 'Inicio de sesión exitoso', user: req.user });
    }
);
// Ruta de login con Passport
router.post('/pplogin', verifyRequiredBody(['email', 'password']),
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


router.get('/ghlogin',
    passport.authenticate('ghlogin', { scope: ['user'] }), async (req, res) => {
    });

router.get('/ghlogincallback',
    passport.authenticate('ghlogin',
        { failureRedirect: `/login?error=${encodeURI('Error al identificar con Github')}` }), async (req, res) => {
            try {
                req.session.user = req.user // req.user es inyectado AUTOMATICAMENTE por Passport al parsear el done()

                req.session.save(err => {
                    if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });

                    res.redirect('/realtimeproducts');
                });
            } catch (err) {
                res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
            }
        });

router.post('/jwtlogin', verifyRequiredBody(['email', 'password']), passport.authenticate('login', { session: false }), (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Usuario o clave no válidos' });
    }
    const token = createToken(req.user, '1h');
    res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 60 * 60 * 1000, httpOnly: true });
    
    res.status(200).json({ message: 'Inicio de sesión exitoso'});
});


router.get('/current', 
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
// router.get('/current', passport.authenticate('current', { failureRedirect: `/current?error=${encodeURI('No hay un token registrado')}`}), async (req, res) => {
//     try {
//         const currentToken = req.user // Asumiendo que req.user ya contiene los datos que quieres enviar
//         const { password, role, _id, ...filteredCurrent } = currentToken;
//         res.status(200).send({ payload: filteredCurrent });
//     } catch (error) {
//         res.status(500).send({ error: error.message });
//     }
// });

router.get('/private', verifyToken, verifyAuthorization('admin'), async (req, res) => {
    try {
        res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido ADMIN!' });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, error: err.message });
    }
});
router.get('/ppadmin', passportCall('jwtlogin'), verifyAuthorization('admin'), async (req, res) => {
    try {
        res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido ADMIN!' });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

// Logout endpoint para manejar tanto sesiones como JWT
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al ejecutar logout' });
        }
        res.clearCookie(`${config.APP_NAME}_cookie`);
        res.status(200).json({ message: 'Logout exitoso' });
    });
});

export default router;
