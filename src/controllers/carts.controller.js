import CartsManager from '../models/dao/cartManager.mdb.js';
import cartModel from '../models/carts.model.js';
import userModel from '../models/users.model.js';
import ProductModel from '../models/products.model.js';

const service = new CartsManager(cartModel, userModel);



export const purchaseCart = async (req, res) => {
    const { cartId } = req.params;
    const user = req.user;

    if (!cartId || !user) {
        return res.status(400).send({ error: 'Cart ID or user is missing' });
    }

    try {
        const result = await service.validationPurchase(cartId, user); // Asegúrate de que `service` esté correctamente importado y tenga el método `purchaseCart`
        res.status(result.status).send(result.payload || { error: result.error });
    } catch (error) {
        console.error("Error in purchaseCart:", error); // Agrega logging para depuración
        res.status(500).send({ error: 'Internal Server Error' });
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

    console.log(req.params)
    try {
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        const result = await service.addProductToCart(cartId, productId, qty);
        res.status(result.status).send(result.payload || { error: result.error });
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).send({ error: 'Internal server error' });
    }
};

export const removeProductFromCart = async (req, res) => {
    const { id, productId } = req.params;
    const result = await service.removeProductFromCart(id, productId);
    res.status(result.status).send(result.payload || { error: result.error });
};

export const clearCartProducts = async (req, res) => {
    const { id } = req.params;
    const result = await service.clearCartProducts(id);
    res.status(result.status).send(result.payload || { error: result.error });
};
