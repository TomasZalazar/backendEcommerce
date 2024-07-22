import productModel from "../products.model.js";
import config from '../../config.js';
import TicketModel from "../tickets.model.js";

class CartsManager {
    constructor(cartModel, userModel) {
        this.cartModel = cartModel;
        this.userModel = userModel;
        this.productModel = productModel;
    }

    purchaseCart = async (cid, user) => {
        const cartResponse = await this.getById(cid); // Obtengo el carrito en base al ID que me dan
        if (cartResponse.status !== 200) {
            throw new Error('Carrito no encontrado');
        }
    
        const cart = cartResponse.payload;
        const userData = user;
        console.log('User data:', userData);
        let ticketAmount = 0;
    
        for (let item of cart.products) {
            const productId = item.product._id;
            const product = await this.productModel.findById(productId);
            
            if (!product) {
                throw new Error(`Producto no encontrado: ${productId}`);
            }
    
            const productStock = product.stock;
            const requestedQuantity = item.qty;
    
            if (requestedQuantity <= productStock) {
                // Modificar la cantidad restante del producto en la base de datos
                const quantityUpdated = productStock - requestedQuantity;
                await this.productModel.findByIdAndUpdate(productId, { stock: quantityUpdated }, { new: true });
    
                // Eliminar el producto del carrito
                await this.removeProductFromCart(cid, productId);
    
                // Generar el ticket de compra
                ticketAmount += requestedQuantity * product.price;
    
            } else {
                // Modificar el stock del producto
                await this.productModel.findByIdAndUpdate(productId, { stock: 0 }, { new: true });
    
                // Dejar la cantidad no comprada en el carrito
                const quantityNotPurchased = requestedQuantity - productStock;
                await this.updateProduct(cid, productId, quantityNotPurchased);
    
                // Generar el ticket con la cantidad comprada
                ticketAmount += productStock * product.price;
            }
        }
    
        // Crear el ticket de compra si hay una cantidad total
        if (ticketAmount > 0) {
            const ticket = {
                amount: ticketAmount,
                purchaser: userData.email
            };
            const ticketFinished = await TicketModel.create(ticket);
            console.log('Ticket created:', ticketFinished);
            return { status: 200, payload: ticketFinished };
        }
    
        return { status: 404, error: 'No products purchased' };
    };
    async getAll() {
        try {
            const carts = await this.cartModel.find().populate('_user_id').populate('products._id').lean();
            return { origin: config.SERVER, status: 200, payload: carts };
        } catch (error) {
            console.error("Error getting carts:", error);
            return { status: 500, error: "Error getting carts" };
        }
    }

    async getById(id) {
        try {
            const cart = await this.cartModel.findById(id).populate('_user_id').populate('products._id').lean();
            if (!cart) {
                return { status: 404, error: "Cart not found" };
            }
            return { origin: config.SERVER, status: 200, payload: cart };
        } catch (error) {
            console.error("Error getting cart by id:", error);
            return { status: 500, error: "Error getting cart by id" };
        }
    }

    async createCart(userId, products) {
        try {
            const user = await this.userModel.findById(userId);
            if (!user) {
                return { status: 400, error: 'User not found' };
            }

            const productPromises = products.map(async product => {
                const prod = await productModel.findById(product._id);
                if (!prod) {
                    throw new Error(`Product not found: ${product._id}`);
                }
            });
            await Promise.all(productPromises);

            const newCart = await this.cartModel.create({ _user_id: userId, products });
            return { origin: config.SERVER, status: 200, payload: newCart };
        } catch (error) {
            console.error("Error creating cart:", error);
            return { status: 500, error: error.message };
        }
    }

    async updateCart(cartId, updateData) {
        try {
            const updatedCart = await this.cartModel.findByIdAndUpdate(cartId, updateData, { new: true }).lean();
            if (!updatedCart) {
                return { status: 404, error: "Cart not found" };
            }
            return { origin: config.SERVER, status: 200, payload: updatedCart };
        } catch (error) {
            console.error("Error updating cart:", error);
            return { status: 500, error: error.message };
        }
    }

    async addProductToCart(cartId, productId, qty = 1) {
        try {
            const product = await this.productModel.findById(productId);
            if (!product) {
                return { status: 404, error: 'Product not found' };
            }

            let cart = await this.cartModel.findById(cartId);
            if (!cart) {
                return { status: 404, error: 'Cart not found' };
            }
            
            const existingProduct = cart.products.find(item => String(item.product._id) === productId);
            if (existingProduct) {
                existingProduct.qty += qty;
            } else {
                cart.products.push({ product: productId, qty });
            }

            await cart.save();
            return { status: 201, message: 'Product added to cart successfully', payload: cart };
        } catch (error) {
            console.error("Error adding product to cart:", error);
            return { status: 500, error: 'Internal server error' };
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await this.cartModel.findById(cartId);
            if (!cart) {
                return { status: 404, error: "Cart not found" };
            }

            cart.products = cart.products.filter(item => String(item._id) !== productId);
            await cart.save();
            return { origin: config.SERVER, status: 200, payload: cart };
        } catch (error) {
            console.error("Error removing product from cart:", error);
            return { status: 500, error: "Internal server error" };
        }
    }

    async clearCartProducts(cartId) {
        try {
            const cart = await this.cartModel.findById(cartId);
            if (!cart) {
                return { status: 404, error: "Cart not found" };
            }
            cart.products = [];
            await cart.save();
            return { origin: config.SERVER, status: 200, payload: cart };
        } catch (error) {
            console.error("Error clearing cart products:", error);
            return { status: 500, error: "Internal server error" };
        }
    }

    async deleteCart(cartId) {
        try {
            const deletedCart = await this.cartModel.findByIdAndDelete(cartId).lean();
            if (!deletedCart) {
                return { status: 404, error: "Cart not found" };
            }
            return { origin: config.SERVER, status: 200, payload: deletedCart };
        } catch (error) {
            console.error("Error deleting cart:", error);
            return { status: 500, error: error.message };
        }
    }
}

export default CartsManager;
