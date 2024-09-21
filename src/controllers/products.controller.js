import ProductManager from '../models/dao/productManager.mdb.js';
import ProductModel from '../models/products.model.js';
import CustomError from '../services/CustomError.class.js'; 
import config, { errorsDictionary } from '../config.js';

const service = new ProductManager(ProductModel);


export const checkOwnership = async (pid, email) => {
    const result = await service.getById(pid);
    const product = result.payload; 
    if (!product) return false;
    return product.owner === email;
};

export const getAllProducts = async (req, res, next) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const result = await service.getAll(limit);
        res.status(result.status).send({ origin: result.origin, payload: result.payload }); 
        
    } catch (error) {
        next(new CustomError(errorsDictionary.PRODUCTS_FETCH_ERROR));
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await service.getById(id);
        if (!result.payload) {
            
            throw new CustomError(errorsDictionary.PRODUCT_NOT_FOUND);
        }
        res.status(result.status).send({ origin: result.origin, payload: result.payload });
        
    } catch (error) {
        
        next(error instanceof CustomError ? error : new CustomError(errorsDictionary.PRODUCTS_FETCH_ERROR));
    }
};

export const createProduct = async (req, res, next) => {
    console.log('Archivos subidos:', req.files);  
    console.log('lo que viene en el req.body', req.body)
    
    const { title, description, price, code, stock, category } = req.body;
    if (!title || !description || !price || !code || !stock || !category) {
        return res.status(400).json({ error: errorsDictionary.FEW_PARAMETERS.message });
    }
     
    try {
        const thumbnails = req.files.map(file => config.STORAGE === 'cloud' ? file.path : file.filename);
        console.log(thumbnails);
        const user = req.user;
        if (user.role === 'premium' || user.role === 'admin') {
            const newProduct = {
                title,
                description,
                price,
                code,
                stock,
                category,
                thumbnails: thumbnails || [],
                owner: user.role === 'premium' ? user.email : 'admin'
            };
            const addedProduct = await service.create(newProduct);
            res.status(201).send({addedProduct, files: req.files});
        } else {
            return res.status(403).json({ error: 'No tienes permiso para crear productos.' });
        }
    } catch (error) {
        console.error('Error:', error);
        next(new CustomError(errorsDictionary.PRODUCT_CREATE_ERROR));
    }
};


export const updateProduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        const updProd = req.body;
        const result = await service.update(id, updProd);
        if (!result.payload) {
            throw new CustomError(errorsDictionary.PRODUCT_NOT_FOUND);
        }
        res.status(result.status).send({ origin: result.origin, payload: result.payload });
    } catch (error) {
        next(error instanceof CustomError ? error : new CustomError(errorsDictionary.PRODUCT_UPDATE_ERROR));
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const { pid } = req.params;
        const { email, role } = req.user;
        // req.logger.info(`Intentando eliminar producto con id: ${pid} por usuario: ${email} con rol: ${role}`);
        let proceedWithDelete = true;
        const product = await service.getById(pid);
        if (!product) {
            // req.logger.warn(`Producto no encontrado con id: ${pid}`);
            throw new CustomError(errorsDictionary.PRODUCT_NOT_FOUND);
        }
        if (role === 'premium') {
            proceedWithDelete = await checkOwnership(pid, email);
            // req.logger.info(`¿El usuario es propietario del producto? ${proceedWithDelete}`);
        }
        if (proceedWithDelete) {
            const result = await service.delete(pid);
            if (!result.payload) {
                // req.logger.warn(`No se pudo eliminar el producto con id: ${pid} (No se encontró el payload)`);
                throw new CustomError(errorsDictionary.PRODUCT_NOT_FOUND);
            }
            req.logger.info(`Producto eliminado con éxito. ID: ${pid}`);
            res.status(200).send({ origin: config.SERVER, payload: 'Producto eliminado' });
        } else {
            // req.logger.warn(`El usuario: ${email} no tiene permisos para eliminar el producto con id: ${pid}`);
            res.status(403).send({ origin: config.SERVER, payload: null, error: 'No tiene permisos para eliminar el producto' });
        }
    } catch (error) {
        req.logger.error(`Error al eliminar el producto: ${error.message}`);
        next(error instanceof CustomError ? error : new CustomError(errorsDictionary.PRODUCT_DELETE_ERROR));
    }
};



export const paginateProducts = async (req, res, next) => {
    try {
        const { limit, page, query, sort } = req.query;
        const parsedQuery = query ? JSON.parse(query) : {};
        const result = await service.paginateProducts({ limit, page, query: parsedQuery, sort });
        res.status(result.status).send({ origin: result.origin, payload: result.payload });
    } catch (error) {
        next(new CustomError(errorsDictionary.PRODUCTS_PAGINATION_ERROR));
    }
};