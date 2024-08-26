import * as chai from 'chai';
import mongoose from 'mongoose';
import ProductManager from '../models/dao/productManager.mdb.js';
import ProductModel from '../models/products.model.js';
import config from '../config.js';

const expect = chai.expect;

const testProduct = {
    title: 'Test Product',
    code: 'AAB01',
    description: 'This is a test product',
    price: 19.99,
    stock: 100,
    owner: new mongoose.Types.ObjectId(),
    category: 'Test Category'
};

const dao = new ProductManager(ProductModel);

describe('Pruebas del DAO de Productos', function () {
    let productId;

    before(async function () {
        await mongoose.connect(config.MONGODB_URI);
        await mongoose.connection.db.collection('products_test').drop();

        // Crear un producto una vez y reutilizarlo
        const result = await dao.create(testProduct);
        if (result.status === 201 && result.payload) {
            productId = result.payload._id.toString();
        } else {
            throw new Error('No se pudo crear el producto');
        }
    });

    after(async function () {
        await mongoose.connection.close();
    });

    it('create() debería devolver un objeto con los datos del nuevo producto', async function () {
        const result = await dao.create(testProduct);
        expect(result.status).to.equal(201);
        expect(result.payload).to.be.an('object');
        expect(result.payload.title).to.equal(testProduct.title);
        expect(result.payload.price).to.equal(testProduct.price);
    });

    it('getOne() debería devolver un objeto de producto que coincida con los criterios dados', async function () {
        const result = await dao.getOne({ _id: productId });
        expect(result.status).to.equal(200);
        expect(result.payload).to.be.an('object');
        expect(result.payload.title).to.equal(testProduct.title);
    });

    it('update() debería devolver un objeto con los datos actualizados del producto', async function () {
        const updatedData = { price: 29.99 };
        const result = await dao.update(productId, updatedData);
    
        // Verifica que el estado es 200
        expect(result.status).to.equal(200);
        expect(result.payload).to.be.an('object');
        expect(result.payload.price).to.equal(updatedData.price);
    
        // Verifica que la actualización se refleja en la base de datos
        const updatedProduct = await dao.getOne({ _id: productId });
        expect(updatedProduct.status).to.equal(200);
        expect(updatedProduct.payload.price).to.equal(updatedData.price);
    });

    it('delete() debería eliminar permanentemente el documento especificado', async function () {
        const result = await dao.delete(productId);
        expect(result.status).to.equal(200);
        expect(result.payload).to.be.an('object');
        expect(result.payload._id.toString()).to.equal(productId.toString());

        // Verifica que el producto ha sido eliminado
        const deletedResult = await dao.getOne({ _id: productId });
        expect(deletedResult.status).to.equal(404);
    });
});
