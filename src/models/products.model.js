import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';
mongoose.pluralize(null);

const collection = 'products'
const productSchema = new mongoose.Schema({
    
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    code: { type: String, required: true },
    stock: { type: Number, required: true },
    thumbnails: { type: [String], default: [] },
    category: { type: String, required: true },
    // owner: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: 'admin' }, // por si quiero usar el ._id 
    owner: { type: String, required: true, default: 'admin' },
}, { timestamps: true });

productSchema.plugin(mongoosePaginate);
const ProductModel = mongoose.model(collection, productSchema);

export default ProductModel;