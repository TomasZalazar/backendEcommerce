import { Router } from 'express';
import { getAllCarts, getCartById, createCart, updateCart, deleteCart, addProductToCart, removeProductFromCart, clearCartProducts, purchaseCart } from '../controllers/carts.controller.js';
import { handlePolicies, verifyToken } from '../services/utils.js';

import config from '../config.js';
import { passportCall } from '../auth/passport.strategies.js';


const router = Router();

router.param('id', async (req, res, next, id) => {
    if (!config.MONGODB_ID_REGEX.test(id)) {
        // Registra el error usando Winston
       
       // Crea el error personalizado y pásalo al middleware de errores
       const error = new CustomError(
        errorsDictionary.INVALID_MONGOID_FORMAT,
        `Id no válido: ${id} - ${errorsDictionary.INVALID_MONGOID_FORMAT.message}`
    );
    return next(error); // Pasar el error al middleware de manejo de errores
}
next();
});
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
router.post('/:cartId/products/:productId',passportCall('jwtlogin'), addProductToCart);
router.delete('/:id/products', verifyToken, clearCartProducts);
router.delete('/:id/products/:productId', verifyToken, removeProductFromCart);

// Ruta para comprar el carrito
router.get('/:cartId/purchase', verifyToken, purchaseCart);

// Rutas protegidas para administradores
router.put('/:id', verifyToken, handlePolicies(['admin']), updateCart);
router.delete('/:id', verifyToken, handlePolicies(['admin']), deleteCart);

export default router;
