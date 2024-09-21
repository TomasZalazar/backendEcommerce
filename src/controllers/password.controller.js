import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import userModel from '../models/users.model.js';
import { createHash } from '../services/utils.js';
import config from '../config.js';
import { sendResetEmail } from '../services/emailService.js';  

class AuthService {
    constructor() {}

    forgotPassword = async (email) => {
        try {
            const user = await userModel.findOne({ email });

            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            const token = jwt.sign({ userId: user._id }, config.SECRET, { expiresIn: '5m' });
            await sendResetEmail(user.email, `http://localhost:4000/api/recover/reset-password?token=${token}`);

            return 'Correo de restablecimiento de contraseña enviado';
        } catch (err) {
            return err.message;
        }
    };

    resetPassword = async (token, newPassword) => {
        try {
            const decoded = jwt.verify(token, config.SECRET);
            const user = await userModel.findById(decoded.userId);
    
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            const isSamePassword = await bcrypt.compare(newPassword, user.password);
    
            if (isSamePassword) {
                throw new Error('La nueva contraseña no puede ser igual a la anterior');
            }

            user.password = createHash(newPassword);
    
            await user.save();
    
            return { message: 'Contraseña restablecida exitosamente', success: true };
        } catch (err) {
            return err.message;
        }
    };
}

export default AuthService;
