import mongoose from "mongoose";
import cartModel from "./carts.model.js";
import mongoosePaginate from 'mongoose-paginate-v2';
mongoose.pluralize(null);

// const collection = 'users_test'; // usar solo para test
const collection = 'users';
const documentSchema = new mongoose.Schema({
    name: String,
    path: String,
    type: String,
  });

const schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    _cart_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'carts' },
    role: { type: String, enum: ['admin', 'premium', 'user'], default: 'user' },
    last_connection: { type: String, default: '' },
    active: { type: Boolean, default: true },
    documents: {
        uploadedFiles: [documentSchema]
      },
    status: { type: String, default: 'Pendiente' }
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
