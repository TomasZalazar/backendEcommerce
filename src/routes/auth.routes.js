import { Router } from 'express';
import  config from '../config.js';
import { adminAuth, verifyAuthorization } from '../services/adminAuth.js';
import { createHash, verifyRequiredBody, createToken, verifyToken } from '../services/utils.js';

import passport from 'passport';
import { passportCall } from '../auth/passport.strategies.js';

const router = Router();


router.get('/hash/:password', async (req, res) => {
    res.status(200).send({ origin: config.SERVER, payload: createHash(req.params.password) });
});

router.post('/register', verifyRequiredBody(['firstName', 'lastName', 'email', 'password']),
    passport.authenticate('register', {
        successRedirect: '/realtimeproducts',
        failureRedirect: `/register?error=El%20usuario%20ya%20existe`
    })
);
// Ruta de login con Passport
router.post('/login', verifyRequiredBody(['email', 'password']),
    passport.authenticate('login', {
        successRedirect: '/realtimeproducts',
        failureRedirect: `/login?error=${encodeURI('Usuario o clave no válidos')}`
    }));
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

// Endpoint autenticación con Passport contra base de datos propia y jwt
router.post('/jwtlogin', verifyRequiredBody(['email', 'password']), passport.authenticate('login', { failureRedirect: `/login?error=${encodeURI('Usuario o clave no válidos')}` }), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).send({ origin: config.SERVER, payload: 'Autenticación fallida' });
        }
        // Crear el token
        const token = createToken(req.user, '1h');
        res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 60 * 60 * 1000, httpOnly: true });

        // Guardar la sesión antes de redirigir
        req.session.user = req.user;
        req.session.save(err => {
            if (err) {
                return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
            }

            res.redirect('/realtimeproducts'); // Redirigir después de guardar la sesión
        });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});
router.get('/current', passport.authenticate('current', { failureRedirect: `/current?error=${encodeURI('No hay un token registrado')}`}), async (req, res) => {
    try {
        const currentToken = req.user // Asumiendo que req.user ya contiene los datos que quieres enviar
        
        res.status(200).json({ payload: currentToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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
router.get('/logout', async (req, res) => {
    try {
        // Destruir la sesión del usuario si se está usando sesiones
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).send({ origin: config.SERVER, payload: null, error: 'Error al ejecutar logout' });
                }
            });
        }

        // Limpiar la cookie que contiene el token JWT si está presente
        if (req.cookies[`${config.APP_NAME}_cookie`]) {
            res.clearCookie(`${config.APP_NAME}_cookie`);
        }

        // Redirigir al usuario a la página de login u otra página de tu aplicación
        res.redirect('/login');
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

export default router;
