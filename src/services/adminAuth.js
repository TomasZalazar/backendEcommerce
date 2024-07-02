import  config  from "../config.js";


 
 export const adminAuth = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin')
        // Si no existe el objeto req.session.user o el role no es admin
        return res.status(401).send({ origin: config.SERVER, payload: 'Acceso no autorizado: se requiere autenticación y nivel de admin' });

    next();
}

export const verifyAuthorization = role => {
    return async (req, res, next) => {
        if (!req.user) return res.status(401).send({ origin: config.SERVER, payload: 'Usuario no autenticado' });
        console.log(req.user.role)
        if (req.user.role !== role) return res.status(403).send({ origin: config.SERVER, payload: 'No tiene permisos para acceder al recurso' });
        
        next();
    }
}
