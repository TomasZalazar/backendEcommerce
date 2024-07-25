import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, paginateProducts } from '../controllers/products.controller.js';
import { uploader } from '../services/uploader.js';
import config from '../config.js';
import { handlePolicies, verifyRequiredBody, verifyToken } from '../services/utils.js';
import { generateMockProducts } from '../mocking.js';


const router = Router();

router.param('id', async (req, res, next, id) => {
    if (!config.MONGODB_ID_REGEX.test(req.params.id)) {
        return res.status(400).send({ origin: config.SERVER, payload: null, error: 'Id no válido' });
    }
    next();
})


// Rutas públicas
router.get('/paginate', paginateProducts);
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Endpoint de mocking con qty como parámetro de ruta
router.get('/mockingproducts/:qty', (req, res) => {
    const qty = parseInt(req.params.qty, 10);
    if (isNaN(qty) || qty <= 0) {
        return res.status(400).send({ error: 'Cantidad no válida' });
    }
    const mockProducts = generateMockProducts(qty);
    res.json(mockProducts);
});
// Rutas protegidas para administradores
router.post('/create', verifyToken, handlePolicies(['admin']), verifyRequiredBody(['title', 'description', 'price', 'stock', 'category']), uploader.array('thumbnails', 4), createProduct);
router.put('/:id', verifyToken, handlePolicies(['admin']), updateProduct);
router.delete('/:id', verifyToken, handlePolicies(['admin']), deleteProduct);

export default router;