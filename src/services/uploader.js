import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config.js';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configura Cloudinary
cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET
});

const cloudStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        return {
            folder: path.basename(req.path),
            allowed_formats: ['jpg', 'png'],
            transformation: [{ width: 640 }],
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
        };
    }
});

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fileType = path.extname(file.originalname).toLowerCase();
        let subFolder = 'other'; // Carpeta por defecto para archivos no especificados

        // Define las carpetas según el tipo de archivo
        if (['.jpg', '.jpeg', '.png'].includes(fileType)) {
            subFolder = 'products';
        } else if (fileType === '.pdf') {
            subFolder = 'documents';
        }

        const uploadPath = `${config.UPLOAD_DIR}/${subFolder}/`;

        // Verifica si la carpeta existe, si no, la crea
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, `${Date.now()}-${originalName.replace(/\s+/g, '_')}`);
    }
});

// Filtro para aceptar solo ciertos tipos de archivos
const fileFilter = (req, file, cb) => {
    const fileType = path.extname(file.originalname).toLowerCase();
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];

    if (allowedTypes.includes(fileType)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido'), false);
    }
};

// Activamos el uploader cloud o local según config.STORAGE
export const uploader = multer({
    storage: config.STORAGE === 'cloud' ? cloudStorage : localStorage,
    fileFilter: fileFilter
});
