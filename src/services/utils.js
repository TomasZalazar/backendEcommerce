import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import  config, {errorsDictionary}  from '../config.js';
import CustomError from './CustomError.class.js';


export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (passwordToVerify, storedHash) => bcrypt.compareSync(passwordToVerify, storedHash);

export const createToken = (payload, duration) => jwt.sign(payload, config.SECRET, { expiresIn: duration });

export const verifyToken = (req, res, next) => {
    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined;
    const cookieToken = req.cookies && req.cookies[`${config.APP_NAME}_cookie`] ? req.cookies[`${config.APP_NAME}_cookie`] : undefined;
    const queryToken = req.query.access_token ? req.query.access_token : undefined;
    const receivedToken = headerToken || cookieToken || queryToken;

    // if (!receivedToken) return res.status(401).send({ origin: config.SERVER, payload: 'Se requiere token' });
    if (!receivedToken) {
        return res.redirect('/login'); // Redirecciona al login
    }
    jwt.verify(receivedToken, config.SECRET, (err, payload) => {
        if (err) return res.status(403).send({ origin: config.SERVER, payload: 'Token no válido' });
        req.user = payload;
        next();
    });
};


export const verifyRequiredBody = (requiredFields) => {
    return (req, res, next) => {


        const missingFields = requiredFields.filter(field => 
            !req.body.hasOwnProperty(field) || req.body[field] === '' || req.body[field] === null || req.body[field] === undefined
        );

        missingFields.forEach(field => {
            console.log(`Campo: ${field}, Valor: ${req.body[field]}, Es faltante: ${!req.body.hasOwnProperty(field) || req.body[field] === '' || req.body[field] === null || req.body[field] === undefined}`);
        });

        if (missingFields.length > 0) {
            console.log('Campos faltantes:', missingFields);
            return next(new CustomError(errorsDictionary.FEW_PARAMETERS, { missingFields }));
        }

        next();
    };
};




export const handlePolicies = policies => {
    return async (req, res, next) => {
        try {

            if (!req.user) {
                throw new CustomError(errorsDictionary.UNAUTHORIZED);
            }

            if (policies.includes(req.user.role)) {
                return next();
            } else {
                throw new CustomError(errorsDictionary.FORBIDDEN);
            }
        } catch (error) {
            next(error); 
        }
    }
};