import { uploader } from '../services/uploader.js';
import { Router } from 'express'


const Upload = Router()



Upload.post('/products', uploader.array('productImages', 3), (req, res) => {
    res.status(200).send({ status: 'OK', payload: 'Imágenes subidas', files: req.files });
});

Upload.post('/profiles', uploader.array('profileImages', 2), (req, res) => {
    res.status(200).send({ status: 'OK', payload: 'Imágenes subidas', files: req.files });
});

Upload.post('/documents', uploader.array('documentImages', 3), (req, res) => {
    res.status(200).send({ status: 'OK', payload: 'Imágenes subidas', files: req.files });
});
export default Upload