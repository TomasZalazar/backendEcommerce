import express from 'express';
import { passportCall } from '../auth/passport.strategies.js'; // Ajusta la ruta si es necesario

const router = express.Router();

// Endpoint protegido que requiere autenticación
router.get('/protected-resource', passportCall('jwtlogin'), (req, res) => {
  res.json({ message: 'Acceso al recurso protegido exitoso', user: req.user });
});



export default router;