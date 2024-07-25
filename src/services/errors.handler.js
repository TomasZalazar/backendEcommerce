import config, { errorsDictionary } from '../config.js';

const errorsHandler = (error, req, res, next) => {
    let customErr = errorsDictionary.UNHANDLED_ERROR; // Error por defecto

    // Verifica que el error tenga la estructura esperada
    if (error && error.type && typeof error.type.code !== 'undefined') {
        const errorCode = error.type.code;
        customErr = Object.values(errorsDictionary).find(err => err.code === errorCode) || customErr;
    }

    // Log de la respuesta para verificar
    console.log(`Enviando respuesta de error: ${customErr.status} - ${customErr.message}`);

    return res.status(customErr.status).send({
        origin: config.SERVER,
        payload: '',
        error: customErr.message
    });
};

export default errorsHandler;