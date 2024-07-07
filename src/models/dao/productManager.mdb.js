class ProductManager {
    constructor(ProductModel) {
        this.ProductModel = ProductModel;
    }

    async getAll(limit) {
        try {
            const products = await this.ProductModel.find().limit(limit);
            return { status: 200, origin: 'DAO', payload: products };
        } catch (error) {
            return { status: 500, origin: 'DAO', payload: { error: error.message } };
        }
    }
    async  getOne(filter){
        try {
            const products = await this.ProductModel.findOne(filter).lean();
            return { status: 200, origin: 'DAO', payload: products };
        } catch (err) {
            return { status: 500, origin: 'DAO', payload: { error: error.message } };
        };
    };

    async getById(id) {
        try {
            const product = await this.ProductModel.findById(id);
            if (product) {
                return { status: 200, origin: 'DAO', payload: product };
            } else {
                return { status: 404, origin: 'DAO', payload: { error: 'Product not found' } };
            }
        } catch (error) {
            return { status: 500, origin: 'DAO', payload: { error: error.message } };
        }
    }

    async create(productData) {
        try {
            const newProduct = new this.ProductModel(productData);
            await newProduct.save();
            return { status: 201, origin: 'DAO', payload: newProduct };
        } catch (error) {
            return { status: 500, origin: 'DAO', payload: { error: error.message } };
        }
    }

    async update(id, productData) {
        try {
            const updatedProduct = await this.ProductModel.findByIdAndUpdate(id, productData, { new: true });
            if (updatedProduct) {
                return { status: 200, origin: 'DAO', payload: updatedProduct };
            } else {
                return { status: 404, origin: 'DAO', payload: { error: 'Product not found' } };
            }
        } catch (error) {
            return { status: 500, origin: 'DAO', payload: { error: error.message } };
        }
    }

    async delete(id) {
        try {
            const deletedProduct = await this.ProductModel.findByIdAndDelete(id);
            if (deletedProduct) {
                return { status: 200, origin: 'DAO', payload: deletedProduct };
            } else {
                return { status: 404, origin: 'DAO', payload: { error: 'Product not found' } };
            }
        } catch (error) {
            return { status: 500, origin: 'DAO', payload: { error: error.message } };
        }
    }

    async paginateProducts({ limit = 10, page = 1, query = {}, sort = {} }) {
        try {
            const options = {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                sort: sort
            };
            const result = await this.ProductModel.paginate(query, options);
            
            return { status: 200, origin: 'DAO', payload: result };
        } catch (error) {
            return { status: 500, origin: 'DAO', payload: { error: error.message } };
        }
    }
}

export default ProductManager;
