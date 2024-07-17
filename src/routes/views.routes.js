import { Router } from "express";
import productModel from "../models/products.model.js"; 
import {  verifyToken } from "../services/utils.js";

const router = Router();

router.get('/realtimeproducts', verifyToken, async (req, res) => {
    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 5,
        lean: true 
    };
    
    const query = {};
    
    try {
        const products = await productModel.paginate(query, options);
        
        // Obtén el cartId del usuario si está autenticado
        let cartId = null;
        if (req.session.user && req.session.user._cart_id) {
            cartId = req.session.user._cart_id._id;
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
            user: req.session.user, // Pasa el usuario a la vista
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});

router.get('/chat', (req, res) => {
    res.render('chat', {});
});

router.get('/register', (req, res) => {
    res.render('register', {});
});

router.get('/login', (req, res) => {
    // Si hay datos de sesión activos, redireccionamos al perfil
    if (req.session.user) return res.redirect('/realtimeproducts');
    res.render('login', {});
});

router.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } 
    res.render('profile', { 
        user: req.session.user,
        login_type: req.session.user.login_type,
        cart: req.session.user._cart_id  // Pasa el carrito del usuario a la vista del perfil
    });
});

export default router;