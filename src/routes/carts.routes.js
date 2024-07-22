import { Router } from 'express';
import { getAllCarts, getCartById, createCart, updateCart, deleteCart, addProductToCart, removeProductFromCart, clearCartProducts, purchaseCart } from '../controllers/carts.controller.js';
import { handlePolicies, verifyToken } from '../services/utils.js';
import { passportCall } from '../auth/passport.strategies.js';
import config from '../config.js';
import CartsManager from '../models/dao/cartManager.mdb.js';
import cartModel from '../models/carts.model.js';
import userModel from '../models/users.model.js';
import productModel from '../models/products.model.js';

const router = Router();
const cartsManager = new CartsManager(cartModel, userModel, productModel);
router.param('id', async (req, res, next, id) => {
    if (!config.MONGODB_ID_REGEX.test(req.params.id)) {
        return res.status(400).send({ origin: config.SERVER, payload: null, error: 'Id no válido' });
    }
    next();
})
router.param('productId', async (req, res, next, id) => {
    if (!config.MONGODB_ID_REGEX.test(req.params.productId)) {
        return res.status(400).send({ origin: config.SERVER, payload: null, error: 'Id del producto no válido' });
    }
    next();
});
// Rutas públicas
router.get('/', getAllCarts);
router.get('/:id', getCartById);

// Rutas protegidas para usuarios autenticados
router.post('/', verifyToken, createCart);
router.post('/:cartId/products/:productId', addProductToCart);
router.delete('/:id/products', verifyToken, clearCartProducts);
router.delete('/:id/products/:productId', verifyToken, removeProductFromCart);

// Ruta para comprar el carrito
router.get('/:cartId/purchase', verifyToken, purchaseCart);

// Rutas protegidas para administradores
router.put('/:id', verifyToken, handlePolicies(['admin']), updateCart);
router.delete('/:id', verifyToken, handlePolicies(['admin']), deleteCart);

export default router;
