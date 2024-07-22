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