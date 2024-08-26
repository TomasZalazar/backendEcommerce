import mongoose from "mongoose";
import cartModel from "./carts.model.js";
import mongoosePaginate from 'mongoose-paginate-v2';
mongoose.pluralize(null);

const collection = 'users_test'; // usar solo para test
// const collection = 'users';

const schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true,  unique: true  },
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
schema.plugin(mongoosePaginate);
const model = mongoose.model(collection, schema);

export default model;
