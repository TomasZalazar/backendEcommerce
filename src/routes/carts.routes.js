import { Router } from 'express';
import { getAllCarts, getCartById, createCart, updateCart, deleteCart, addProductToCart, removeProductFromCart, clearCartProducts } from '../controllers/carts.controller.js';

const router = Router();

router.get('/', getAllCarts);
router.get('/:id', getCartById);
router.post('/', createCart);
router.put('/:id', updateCart);
router.delete('/:id', deleteCart);
router.post('/:id/products/:productId', addProductToCart);
router.delete('/:id/products/:productId', removeProductFromCart);
router.delete('/:id/products', clearCartProducts);

export default router;
