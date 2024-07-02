import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, paginateProducts } from '../controllers/products.controller.js';
import { uploader } from '../services/uploader.js';

const router = Router();

router.get('/paginate', paginateProducts);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', uploader.array('thumbnails', 4), createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
