import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, paginateProducts } from '../controllers/products.controller.js';
import { uploader } from '../services/uploader.js';
import config from '../config.js';
import { handlePolicies } from '../services/utils.js';

const router = Router();

router.param('id', async (req, res, next, id) => {
    if (!config.MONGODB_ID_REGEX.test(req.params.id)) {
        return res.status(400).send({ origin: config.SERVER, payload: null, error: 'Id no válido' });
    }
    next();
})


router.get('/paginate', handlePolicies(['admin']), paginateProducts);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', uploader.array('thumbnails', 4), createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
