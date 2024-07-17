import productModel from "../products.model.js";
import config from '../../config.js';
import TicketModel from "../tickets.model.js";

class CartsManager {
    constructor(cartModel, userModel) {
        this.cartModel = cartModel;
        this.userModel = userModel;
        this.productModel = productModel;
    }

    async purchaseCart(cartId, userEmail, req) {
        try {
            // Obtener el token desde la cookie
            const token = req.cookies[`${config.APP_NAME}_cookie`];

            // Verificar el token
            const decoded = jwt.verify(token, config.SECRET);
            const userId = decoded._id;

            // Verificar si el usuario tiene permiso para realizar la compra
            console.log('User ID:', userId);

            // Obtener el carrito del usuario
            const cart = await this.getCartById(cartId, userId);
            if (!cart) {
                console.error('Carrito no encontrado');
                return { status: 404, error: 'Carrito no encontrado' };
            }
            console.log('Carrito encontrado:', cart);

            let totalAmount = 0;
            const unavailableProducts = [];

            for (const cartProduct of cart.products) {
                const product = cartProduct.product;
                const availableStock = product.stock;

                if (availableStock >= cartProduct.quantity) {
                    // Suficiente stock para comprar
                    product.stock -= cartProduct.quantity;
                    totalAmount += product.price * cartProduct.quantity;
                    await product.save();
                } else {
                    // No hay suficiente stock, marcar como no disponible
                    unavailableProducts.push(product._id);
                }
            }

            // Filtrar los productos comprados y no disponibles
            const purchasedProducts = cart.products.filter(cartProduct => !unavailableProducts.includes(cartProduct.product._id));

            let ticket = null;
            if (purchasedProducts.length > 0) {
                ticket = new TicketModel({
                    amount: totalAmount,
                    purchaser: userEmail,
                });

                await ticket.save();
                console.log('Ticket creado:', ticket);
            }

            // Actualizar el carrito solo con productos no disponibles
            cart.products = cart.products.filter(cartProduct => unavailableProducts.includes(cartProduct.product._id));
            await cart.save();

            console.log('Compra realizada con éxito');
            return {
                status: 200,
                payload: {
                    message: 'Compra realizada con éxito',
                    ticket: ticket,
                    unavailableProducts: unavailableProducts,
                },
            };
        } catch (error) {
            console.error('Error al procesar la compra:', error);
            return { status: 500, error: 'Error al procesar la compra' };
        }
    }


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
