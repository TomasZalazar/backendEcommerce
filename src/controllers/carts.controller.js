import CartsManager from '../models/dao/cartManager.mdb.js';
import cartModel from '../models/carts.model.js';
import userModel from '../models/users.model.js';
import ProductModel from '../models/products.model.js';

const cartsManager = new CartsManager(cartModel, userModel);



export const purchaseCart = async (req, res) => {
    const { cartId } = req.params;
    const userEmail = req.user.email; 
    console.log(userEmail)// Asumiendo que el email del usuario está en req.user

    const result = await cartsManager.purchaseCart(cartId, userEmail, req);
    res.status(result.status).send(result.payload || { error: result.error });
};

export const getAllCarts = async (req, res) => {
    const result = await cartsManager.getAll();
    res.status(result.status).send(result.payload || { error: result.error });
};

export const getCartById = async (req, res) => {
    const { id } = req.params;
    const result = await cartsManager.getById(id);
    res.status(result.status).send(result.payload || { error: result.error });
};


export const createCart = async (req, res) => {
    const { userId, products } = req.body;
    const result = await cartsManager.createCart(userId, products);
    res.status(result.status).send(result.payload || { error: result.error });
};

export const updateCart = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const result = await cartsManager.updateCart(id, updateData);
    res.status(result.status).send(result.payload || { error: result.error });
};

export const deleteCart = async (req, res) => {
    const { id } = req.params;
    const result = await cartsManager.deleteCart(id);
    res.status(result.status).send(result.payload || { error: result.error });
};


export const addProductToCart = async (req, res) => {
    const { cartid, productId } = req.params;
    const { qty } = req.body;
    try {
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        const result = await cartsManager.addProductToCart(cartid, productId, qty);
        res.status(result.status).send(result.payload || { error: result.error });
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).send({ error: 'Internal server error' });
    }
};

export const removeProductFromCart = async (req, res) => {
    const { id, productId } = req.params;
    const result = await cartsManager.removeProductFromCart(id, productId);
    res.status(result.status).send(result.payload || { error: result.error });
};

export const clearCartProducts = async (req, res) => {
    const { id } = req.params;
    const result = await cartsManager.clearCartProducts(id);
    res.status(result.status).send(result.payload || { error: result.error });
};
