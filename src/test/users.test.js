import * as chai from 'chai';
import mongoose from 'mongoose';
import UserManager from '../models/dao/userManager.mdb.js'; 
import UserModel from '../models/users.model.js'; 
import config from '../config.js';

const expect = chai.expect;
const testUser = {
    firstName: 'Tomas',
    lastName: 'Zalazar',
    email: 'tomas@gmail.com',
    password: 'tomaszalazar',
    _cart_id: new mongoose.Types.ObjectId() 
};

describe('Test DAO Users', function () {
    before(async function () {
        await mongoose.connect(config.MONGODB_URI);
        await mongoose.connection.db.collection('users_test').drop();
    });

    after(async function () {
        await mongoose.connection.close();
    });

    it('get() debe retornar un array de usuarios', async function () {
        const dao = new UserManager(UserModel); // Usa UserModel aquí
        const result = await dao.getAll();
        expect(result.payload).to.be.an('array');
    });

    it('save() debe retornar un objeto con los datos del nuevo usuario', async function () {
        const dao = new UserManager(UserModel); // Usa UserModel aquí
        const result = await dao.add(testUser);
        expect(result.payload).to.be.an('object');
        expect(result.payload._cart_id).to.be.not.null;
        expect(result.payload.password).to.be.equal(testUser.password);
    });

    it('getBy() debe retornar un objeto coincidente con el criterio indicado', async function () {
        const dao = new UserManager(UserModel); // Usa UserModel aquí
        await dao.add(testUser);
        const fetchedUser = await dao.getOne({ email: testUser.email });
        expect(fetchedUser).to.be.an('object');
        expect(fetchedUser.email).to.be.equal(testUser.email);
    });

    it('update() debe retornar un objeto con los datos modificados', async function () {
        const dao = new UserManager(UserModel); // Usa UserModel aquí
        const savedUser = await dao.add(testUser);
        const modifiedMail = 'nuevoemail@nuevoemail.com';
        const updatedUser = await dao.update(savedUser.payload._id, { email: modifiedMail });
        expect(updatedUser.payload).to.be.an('object');
        expect(updatedUser.payload.email).to.be.equal(modifiedMail);
    });

    it('delete() debe borrar definitivamente el documento indicado', async function () {
        const dao = new UserManager(UserModel); // Usa UserModel aquí
        const savedUser = await dao.add(testUser);
        const result = await dao.delete(savedUser.payload._id);
        console.log(savedUser._id)
        expect(result.payload).to.be.an('object');
        expect(result.payload._id).to.be.deep.equal(savedUser.payload._id);
    });
});
