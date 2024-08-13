import { createHash, isValidPassword, createToken, verifyToken } from '../services/utils.js';
import UserManager from '../models/dao/userManager.mdb.js';
import userModel from '../models/users.model.js';
import  config  from '../config.js';
import mongoose from 'mongoose';

const userManager = new UserManager(userModel);

export const getUsers = async (req, res) => {
    const result = await userManager.getAll();
    res.status(result.status).send(result.payload || { error: result.error });
};

export const getUserById = async (req, res) => {
    const { id } = req.params;
    const result = await userManager.getById(id);
    res.status(result.status).send(result.payload || { error: result.error });
};

export const createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        const existingUser = await userModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).send({ error: 'El correo electrónico ya está registrado.' });
        }

        const hashedPassword = createHash(password);
        const newUser = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role || 'user'
        };

        const result = await userManager.add(newUser);
        res.status(result.status).send(result.payload || { error: result.error });
    } catch (error) {
        res.status(500).send({ error: "Error al crear usuario" });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;
    const result = await userManager.update(id, updatedUser);
    res.status(result.status).send(result.payload || { error: result.error });
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    const result = await userManager.delete(id);
    res.status(result.status).send(result.payload || { error: result.error });
};

export const aggregateUsers = async (req, res) => {
    try {
        const { role } = req.params;
        if (['admin', 'premium', 'user'].includes(role)) {
            const match = { role };
            const sort = { totalGrade: -1 };
            const process = await userManager.getAggregated(match, sort);
            res.status(200).send({ origin: config.SERVER, payload: process });
        } else {
            res.status(200).send({ origin: config.SERVER, payload: null, error: 'role: solo se acepta admin, premium o user' });
        }
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
};

export const paginateUsers = async (req, res) => {
    try {
        const { page, limit } = req.params;
        const filter = { role: 'admin' };
        const options = { page, limit, sort: { lastName: 1 } };
        const process = await userManager.getPaginated(filter, options);
        res.status(200).send({ origin: config.SERVER, payload: process });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
};

export const toggleUserRole = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ origin: config.SERVER, payload: null, error: 'ID inválido.' });
        }
        if (req.user._id.toString() === id) {
            return res.status(403).send({ origin: config.SERVER, payload: null, error: 'No puedes modificar tu propio rol.' });
        }

        const user = await userManager.getById(id);

        if (!user) {
            return res.status(404).send({ origin: config.SERVER, payload: null, error: 'Usuario no encontrado.' });
        }

        // Alternar el rol del usuario
        const newRole = user.payload.role === 'premium' ? 'user' : 'premium';
        
        // Actualizar el rol del usuario
        const updatedUser = await userManager.update(id, { role: newRole });

        res.status(updatedUser.status).send(updatedUser.payload || { error: updatedUser.error });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
};