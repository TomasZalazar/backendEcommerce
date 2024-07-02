import CartsManager from '../models/dao/cartManager.mdb.js';
import cartModel from '../models/carts.model.js';
import userModel from '../models/users.model.js';

const cartsManager = new CartsManager(cartModel, userModel);

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
    const { id, productId } = req.params;
    const { qty } = req.body;
    const result = await cartsManager.addProductToCart(id, productId, qty);
    res.status(result.status).send(result.payload || { error: result.error });
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
