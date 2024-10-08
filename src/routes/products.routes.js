import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, paginateProducts } from '../controllers/products.controller.js';
import { uploader } from '../services/uploader.js';
import config, { errorsDictionary } from '../config.js';
import { handlePolicies, verifyRequiredBody, verifyToken } from '../services/utils.js';
import { generateMockProducts } from '../services/mocking.js';
import CustomError from '../services/CustomError.class.js';




const products = Router();

products.param('id', async (req, res, next, id) => {
    if (!config.MONGODB_ID_REGEX.test(id)) {
       
       const error = new CustomError(
        errorsDictionary.INVALID_MONGOID_FORMAT,
        `Id no válido: ${id} - ${errorsDictionary.INVALID_MONGOID_FORMAT.message}`
    );
    return next(error); 
}
next();
});


// Rutas públicas
products.get('/paginate', paginateProducts);
products.get('/', getAllProducts);
products.get('/:id', getProductById);

// Rutas protegidas para administradores
products.post('/create', verifyToken, handlePolicies(['admin','premium']), verifyRequiredBody(['title', 'description', 'price', 'stock', 'category', 'code']), uploader.fields('thumbnails', 3),createProduct);


products.put('/:id', verifyToken, handlePolicies(['admin']), updateProduct);
products.delete('/:pid', verifyToken, handlePolicies(['admin','premium']), deleteProduct);


// Endpoint de mocking con qty como parámetro de ruta
products.get('/mockingproducts/:qty', (req, res, next) => {
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
export default products;
