import nodemailer from 'nodemailer';
import config from '../config.js';

const transporter = nodemailer.createTransport({
    service: 'Gmail', // Puedes usar otro servicio de correo
    auth: {
        user: config.GOOGLE_USER,
        pass: config.GOOGLE_APLICATION_PASSWORD,
    },
});

export const sendPurchaseEmail = async (to, subject, text) => {
    const mailOptions = {
        from: config.GOOGLE_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export const sendResetEmail = async (to, link) => {
    const mailOptions = {
        from: config.GOOGLE_USER,
        to,
        subject: 'Restablecimiento de contraseña',
        html: `<p>Haga clic en el siguiente enlace para restablecer su contraseña: <a href="${link}">${link}</a></p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        
    } catch (error) {
        console.error('Error al enviar el correo de restablecimiento:', error);
    }
};