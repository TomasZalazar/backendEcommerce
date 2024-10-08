import CartsManager from '../models/dao/cartManager.mdb.js';
import cartModel from '../models/carts.model.js';
import userModel from '../models/users.model.js';
import ProductModel from '../models/products.model.js';

const service = new CartsManager(cartModel, userModel);

export const checkOwnership = async (pid, email) => {
    const result = await service.getById(pid);
    const product = result.payload; 
    if (!product) return false;
    return product.owner === email;
};

export const purchaseCart =  async (req, res) => {
    const { cartId } = req.params;
    const user = req.user;

    if (!cartId || !user) {
        return res.status(400).send({ error: 'Cart ID or user is missing' });
    }

    try {
        
        const result = await service.purchaseCart(cartId, user);

        if (result.status === 200) {
            return res.status(200).send(result.payload);
        } else {
            return res.status(result.status).send({ error: result.error });
        }
    } catch (error) {
        console.error('Error in purchaseCart:', error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
};

export const getAllCarts = async (req, res) => {
    const result = await service.getAll();
    res.status(result.status).send(result.payload || { error: result.error });
};

export const getCartById = async (req, res) => {
    const { id } = req.params;
    const result = await service.getById(id);
    res.status(result.status).send(result.payload || { error: result.error });
};


export const createCart = async (req, res) => {
    const { userId, products } = req.body;
    const result = await service.createCart(userId, products);
    res.status(result.status).send(result.payload || { error: result.error });
};

export const updateCart = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const result = await service.updateCart(id, updateData);
    res.status(result.status).send(result.payload || { error: result.error });
};

export const deleteCart = async (req, res) => {
    const { id } = req.params;
    const result = await service.deleteCart(id);
    res.status(result.status).send(result.payload || { error: result.error });
};

export const addProductToCart = async (req, res) => {
    const { cartId, productId } = req.params;
    const { qty } = req.body; 
    const user = req.user;

    if (!cartId || !productId || !qty || !user) {
        return res.status(400).send({ error: 'Missing parameters' });
    }

    try {
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        if (user.role === 'premium') {
            const isOwner = await checkOwnership(productId, user.email);
            if (isOwner) {
                return res.status(403).send({ error: 'You cannot add your own products to your cart' });
            }
        }

        const result = await service.addProductToCart(cartId, productId, qty);
        if (result.status === 200) {
            return res.status(200).send({ payload: 'Product added to cart successfully' });
        } else {
            return res.status(result.status).send({ error: result.error });
        }

    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).send({ error: 'Internal server error' });
    }
};

export const removeProductFromCart = async (req, res) => {
    const { cartId, productId } = req.params;
    const result = await service.removeProductFromCart(cartId, productId);
    res.status(result.status).send(result.payload || { error: result.error });
};

export const clearCartProducts = async (req, res) => {
    const { id } = req.params;
    const result = await service.clearCartProducts(id);
    res.status(result.status).send(result.payload || { error: result.error });
};
