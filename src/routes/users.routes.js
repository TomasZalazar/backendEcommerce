import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser, aggregateUsers, paginateUsers, toggleUserRole, uploadDocuments } from '../controllers/users.controller.js';
import { handlePolicies, verifyToken } from '../services/utils.js';
import { verifyRequiredBody } from '../services/utils.js';
import config from '../config.js';
import { uploader } from '../services/uploader.js';

const router = Router();
router.param('id', async (req, res, next, id) => {
    if (!config.MONGODB_ID_REGEX.test(id)) {
        req.logger.error('Id no válido');
        return res.status(400).send({ origin: config.SERVER, payload: null, error: 'Id no válido' });
    }
    next();
});
// Rutas públicas
router.get('/', getUsers);
router.get('/:id', getUserById);

// Rutas protegidas para la creación de usuarios
router.post('/create', verifyRequiredBody(['firstName', 'lastName', 'email', 'password']), createUser);

// Rutas protegidas para administradores
router.put('/:id', verifyToken, handlePolicies(['admin']), updateUser);
router.delete('/:id', verifyToken, handlePolicies(['admin']), deleteUser);

router.get('/aggregate/:role', verifyToken, handlePolicies(['admin']), aggregateUsers);
router.get('/paginate/:page/:limit', verifyToken, paginateUsers);

// Admin puede alternar el rol de usuario entre premium y user
router.get('/premium/:id', verifyToken, handlePolicies(['admin']), toggleUserRole);

router.post('/:typeDoc/documents',verifyToken, uploader.array('documentsFiles', 3), uploadDocuments)



export default router;