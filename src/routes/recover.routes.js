import { Router } from 'express';
import AuthService from '../controllers/password.controller.js';

const authRouter = Router();
const authService = new AuthService();

authRouter.get('/forgot-password', (req, res) => {
    res.render('forgot-password', {
        title: 'Forgot Password'
    });
});

authRouter.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    
    if (result.includes('error')) {
        res.status(400).send(result);
    } else {
        res.send(result);
    }
});

authRouter.get('/reset-password', (req, res) => {


    const { token } = req.query;
    

    if (!token) {
        return res.status(400).send('Token is missing or invalid');
    }

    res.render('reset-password', { title: 'Reset Password', token });
});

authRouter.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    
    if (result.success) {
        res.send({ message: result.message, redirectUrl: '/login' }); 
    } else {
        res.status(400).send(result.message);
    }
});

export default authRouter;