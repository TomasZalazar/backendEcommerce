import mongoose from 'mongoose';
import usersModel from './users.model.js';
import productModel from './products.model.js';

mongoose.pluralize(null);

const collection = 'carts';
// const collection = 'carts_test'; // usar solo para test

const schema = new mongoose.Schema({
    _user_id: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'users' },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'products' },
        qty: { type: Number, required: true }
    }]
});

schema.pre(/^find/, function () {
    this.populate({
        path: '_user_id',
        model: usersModel
    }).populate({
        path: 'products.product',
        model: productModel
    });
});


const model = mongoose.model(collection, schema);

export default model;
