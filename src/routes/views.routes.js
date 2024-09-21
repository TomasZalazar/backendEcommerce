import { Router } from "express";
import productModel from "../models/products.model.js";
import cartModel from "../models/carts.model.js"
import { verifyToken } from "../services/utils.js";


const views = Router();

views.get('/realtimeproducts', verifyToken, async (req, res) => {
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
views.get('/uploadProducts', verifyToken, (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    const authToken = req.cookies['TOMAS_APP_cookie'];
    res.render('upload-product', {
        user: req.user,
        authToken: authToken
    });
});
views.get('/chat', verifyToken, (req, res) => {
    res.render('chat', { user: req.user });
});
views.get('/upload', verifyToken, (req, res) => {

    if (!req.user) {
        return res.redirect('/login');
    }
    res.render('uploader', { user: req.user });
});
views.get('/register', (req, res) => {
    res.render('register', {});
});

views.get('/login', (req, res) => {
    // Si hay datos de sesión activos, redireccionamos al perfil
    if (req.user) return res.redirect('/realtimeproducts');
    res.render('login', {});
});

views.get('/profile', verifyToken, (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    res.render('profile', {
        user: req.user,
        login_type: req.user.login_type,
        cart: req.user._cart_id  // Pasa el carrito del usuario a la vista del perfil
    });
});

views.get('/premiumDocs', verifyToken, async (req, res) => {

    const userId = req.user._id;
    res.status(200).render('premiumDocs', { userId });
});
views.get('/home', async (req, res) => {
    try {
        const products = await productModel.find().limit(3).lean();
        const authToken = req.cookies['TOMAS_APP_cookie'];

        res.render('home', {
            user: req.user,
            products,
            authToken        // Token de autenticación
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});
views.get('/cartUser', verifyToken, async (req, res) => {
    if (!req.user) return res.redirect('/login');

    const cartId = req.user._cart_id ? req.user._cart_id._id : null;

    if (!cartId) {
        return res.status(400).send('Cart ID is missing or invalid.');
    }

    try {
        const cart = await cartModel.findById(cartId).populate('products.product');
        if (!cart) {
            return res.status(404).send('Cart not found.');
        }

        res.render('cart', { 
            cart: cart,
            user: req.user,
            cartId: cartId 
        });
    } catch (error) {
        console.error('Error al obtener el carrito:', error.message || error);
        res.status(500).send(`Error interno del servidor: ${error.message}`);
    }
});
views.get('/home',  async (req, res) => {
    try {
        const products = await productModel.find().limit(3).lean();  // Mostrar 3 productos destacados
        const authToken = req.cookies['TOMAS_APP_cookie'];

        res.render('home', {
            user: req.user,  // Información del usuario
            products,        // Productos destacados
            authToken        // Token de autenticación
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});






export default views;
