import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, paginateProducts } from '../controllers/products.controller.js';
import { uploader } from '../services/uploader.js';
import config, { errorsDictionary } from '../config.js';
import { handlePolicies, verifyRequiredBody, verifyToken } from '../services/utils.js';
import { generateMockProducts } from '../services/mocking.js';
import CustomError from '../services/CustomError.class.js';



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


// Rutas públicas
router.get('/paginate', paginateProducts);
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Endpoint de mocking con qty como parámetro de ruta
router.get('/mockingproducts/:qty', (req, res, next) => {
    const qty = parseInt(req.params.qty, 10);
    if (isNaN(qty) || qty <= 0) {
        const error = new CustomError(
            errorsDictionary.INVALID_PARAMETER.code,
            `${errorsDictionary.INVALID_PARAMETER.message}: ${req.params.qty}`
        );
        return next(error); // Pasar el error al middleware de manejo de errores
    }
    const mockProducts = generateMockProducts(qty);
    res.json(mockProducts);
});
// Rutas protegidas para administradores
router.post('/create', verifyToken, handlePolicies(['admin']), verifyRequiredBody(['title', 'description', 'price', 'stock', 'category']), uploader.array('thumbnails', 4), createProduct);
router.put('/:id', verifyToken, handlePolicies(['admin']), updateProduct);
router.delete('/:id', verifyToken, handlePolicies(['admin']), deleteProduct);

export default router;