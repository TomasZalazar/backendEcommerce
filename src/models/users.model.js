import mongoose from "mongoose";
import cartModel from "./carts.model.js";

mongoose.pluralize(null);

const collection = 'users';

const schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    _cart_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'carts' },
    role: { type: String, enum: ['admin', 'premium', 'user'], default: 'user' }
});

schema.pre('find', function () {
    this.populate({ path: '_cart_id', model: cartModel });
});

schema.pre('findOne', function () {
    this.populate({ path: '_cart_id', model: cartModel });
});

const model = mongoose.model(collection, schema);

export default model;
