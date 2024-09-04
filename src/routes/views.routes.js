import { Router } from "express";
import productModel from "../models/products.model.js"; 
import { verifyToken } from "../services/utils.js";
import CustomError from "../services/CustomError.class.js";
import { errorsDictionary } from "../config.js";

const router = Router();

router.get('/realtimeproducts', verifyToken, async (req, res) => {
    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 5,
        lean: true 
    };
    
    const query = {};
    const authToken = req.cookies['TOMAS_APP_cookie']
    
    try {
        const products = await productModel.paginate(query, options);
        
        // Obtén el cartId del usuario si está autenticado
        let cartId = null;
        if (req.user && req.user._cart_id) {
            cartId = req.user._cart_id._id;
        }
        
        res.render('realTimeProducts', {
            products: products.docs,
            totalPages: products.totalPages,
            currentPage: options.page,
            showPrev: options.page > 1,
            showNext: options.page < products.totalPages,
            prevPage: options.page > 1 ? options.page - 1 : null,
            nextPage: options.page < products.totalPages ? options.page + 1 : null,
            cartId: cartId,  // Pasa el cartId a la vista
            user: req.user, // Pasa el usuario a la vista
            authToken: authToken
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});
router.get('/uploadProducts', verifyToken, (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    const authToken = req.cookies['TOMAS_APP_cookie']; 
    res.render('upload-product', { 
        user: req.user,
        authToken: authToken 
    });
});
router.get('/chat', verifyToken, (req, res) => {
    res.render('chat', { user: req.user });
});
router.get('/upload', verifyToken, (req, res) => {
   
    if (!req.user) {
        return res.redirect('/login');
    }
    res.render('uploader', { user: req.user });
});
router.get('/register', (req, res) => {
    res.render('register', {});
});

router.get('/login', (req, res) => {
    // Si hay datos de sesión activos, redireccionamos al perfil
    if (req.user) return res.redirect('/realtimeproducts');
    res.render('login', {});
});

router.get('/profile', verifyToken, (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    } 
    res.render('profile', { 
        user: req.user,
        login_type: req.user.login_type,
        cart: req.user._cart_id  // Pasa el carrito del usuario a la vista del perfil
    });
});

router.get('/premiumDocs', verifyToken, async (req, res) => {
    
        const userId = req.user._id;
        res.status(200).render('premiumDocs', { userId });
});

export default router;
