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

// Aquí agregas la nueva función
export const sendWelcomeEmail = async (to, firstName) => {
    const subject = '¡Bienvenido a TodoTienda!';
    const text = `
Hola ${firstName},

¡Gracias por registrarte en TodoTienda!

Estamos emocionados de tenerte con nosotros. A continuación, te mostramos algunos detalles sobre cómo usar nuestra plataforma:

1. Explora nuestra amplia gama de productos.
2. Agrega los productos a tu carrito y realiza tu compra.
3. Si tienes alguna pregunta, no dudes en contactarnos.

Siéntete libre de navegar por el sitio y disfrutar de tu experiencia de compra.

¡Gracias por confiar en TodoTienda!

Saludos cordiales,
El equipo de TodoTienda
`;

    const mailOptions = {
        from: config.GOOGLE_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email de bienvenida enviado exitosamente');
    } catch (error) {
        console.error('Error al enviar el email de bienvenida:', error);
    }
};