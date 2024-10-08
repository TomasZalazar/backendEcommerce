import { Router } from 'express';
import { getAllCarts, getCartById, createCart, updateCart, deleteCart, addProductToCart, removeProductFromCart, clearCartProducts, purchaseCart } from '../controllers/carts.controller.js';
import { handlePolicies, verifyToken } from '../services/utils.js';

import config, { errorsDictionary } from '../config.js';
import CustomError from '../services/CustomError.class.js';

const cart = Router();

cart.param('id', async (req, res, next, id) => {
    if (!config.MONGODB_ID_REGEX.test(id)) {

       const error = new CustomError(
        errorsDictionary.INVALID_MONGOID_FORMAT,
        `Id no válido: ${id} - ${errorsDictionary.INVALID_MONGOID_FORMAT.message}`
    );
    return next(error);
}
next();
});
export const checkOwnership = async (pid, email) => {
    const result = await service.getById(pid);
    const product = result.payload; 
    if (!product) return false;
    return product.owner === email;
};
cart.param('productId', async (req, res, next, id) => {
    if (!config.MONGODB_ID_REGEX.test(req.params.productId)) {
        return res.status(400).send({ origin: config.SERVER, payload: null, error: 'Id del producto no válido' });
    }
    next();
});
// Rutas públicas
cart.get('/', getAllCarts);
cart.get('/:id', getCartById);

// Rutas protegidas para usuarios autenticados
cart.post('/', verifyToken, createCart);
cart.post('/:cartId/products/:productId',verifyToken,handlePolicies(['admin','user','premium']), addProductToCart);
cart.delete('/:id/products', verifyToken, clearCartProducts);
cart.delete('/:cartId/products/:productId', verifyToken, removeProductFromCart);

// Ruta para comprar el carrito
cart.post('/:cartId/purchase', verifyToken, purchaseCart);

// Rutas protegidas para administradores
cart.put('/:id', verifyToken, handlePolicies(['admin']), updateCart);
cart.delete('/:id', verifyToken, handlePolicies(['admin']), deleteCart);

export default cart;
