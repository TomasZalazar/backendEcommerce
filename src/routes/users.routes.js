import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser, aggregateUsers, paginateUsers } from '../controllers/users.controller.js';
import { verifyToken } from '../services/utils.js';
import { verifyRequiredBody } from '../services/utils.js';
import { adminAuth } from '../services/adminAuth.js';
import config from '../config.js';

const router = Router();
router.param('id', async (req, res, next, id) => {
    if (!config.MONGODB_ID_REGEX.test(req.params.id)) {
        return res.status(400).send({ origin: config.SERVER, payload: null, error: 'Id no válido' });
    }
    next();
})

router.get('/',  getUsers);
router.get('/:id', verifyToken, getUserById);
router.post('/create', verifyRequiredBody(['firstName', 'lastName', 'email', 'password']), createUser);
router.put('/:id', verifyToken, verifyRequiredBody(['firstName', 'lastName', 'email', 'password']), updateUser);
router.delete('/:id', verifyToken, deleteUser);
router.get('/aggregate/:role', adminAuth, aggregateUsers);
router.get('/paginate/:page/:limit', verifyToken, paginateUsers);

export default router;
