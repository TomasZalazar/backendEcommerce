import ProductManager from '../models/dao/productManager.mdb.js';
import ProductModel from '../models/products.model.js';
import CustomError from '../services/CustomError.class.js'; // Asegúrate de tener esta clase para manejar los errores
import { errorsDictionary } from '../config.js';

const service = new ProductManager(ProductModel);

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
    const { title, description, price, code, stock, category } = req.body;

    if (!title || !description || !price || !code || !stock || !category) {
        return res.status(400).json({ error: errorsDictionary.FEW_PARAMETERS.message });
    }
    
    const thumbnails = req.files ? req.files.map(file => file.filename) : [];
    try {
        const newProduct = {
            title,
            description,
            price,
            code,
            stock,
            category,
            thumbnails: thumbnails || []
        };
        const addedProduct = await service.create(newProduct);
        res.status(201).json(addedProduct);
    } catch (error) {
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
        const id = req.params.id;
        const result = await service.delete(id);
        if (!result.payload) {
            throw new CustomError(errorsDictionary.PRODUCT_NOT_FOUND);
        }
        req.logger.info(`Producto eliminado con el id: ${id}`);
        res.status(result.status).send({ origin: result.origin, payload: result.payload });
    } catch (error) {
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