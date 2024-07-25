import ProductManager from '../models/dao/productManager.mdb.js';
import ProductModel from '../models/products.model.js';

const productManager = new ProductManager(ProductModel);

export const getAllProducts = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const result = await productManager.getAll(limit);
        res.status(result.status).send({ origin: result.origin, payload: result.payload }); 
    } catch (error) {
        res.status(500).send({ error: "Error al obtener productos" });
    }
};

export const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await productManager.getById(id);
        res.status(result.status).send({ origin: result.origin, payload: result.payload });
    } catch (error) {
        res.status(500).send({ error: "Error al obtener producto" });
    }
};

export const createProduct = async (req, res) => {
    const { title, description, price, code, stock, category } = req.body;

    if (!title || !description || !price || !code || !stock || !category) {
        return res.status(400).json({ error: 'Todos los campos requeridos deben estar presentes.' });
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
        const addedProduct = await ProductManager.create(newProduct);
        res.status(201).json(addedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const updProd = req.body;
        const result = await productManager.update(id, updProd);
        res.status(result.status).send({ origin: result.origin, payload: result.payload });
    } catch (error) {
        res.status(500).send({ error: "Error al actualizar producto" });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await productManager.delete(id);
        res.status(result.status).send({ origin: result.origin, payload: result.payload });
    } catch (error) {
        res.status(500).send({ error: "Error al eliminar producto" });
    }
};

export const paginateProducts = async (req, res) => {
    try {
        const { limit, page, query, sort } = req.query;
        const parsedQuery = query ? JSON.parse(query) : {};
        const result = await productManager.paginateProducts({ limit, page, query: parsedQuery, sort });
        res.status(result.status).send({ origin: result.origin, payload: result.payload });
    } catch (error) {
        res.status(500).send({ error: "Error al obtener productos paginados" });
    }
};
