import productModel from "../products.model.js";
import config from '../../config.js';
import TicketModel from "../tickets.model.js";
import { sendPurchaseEmail } from "../../services/emailService.js";

class CartsManager {
    constructor(cartModel, userModel) {
        this.cartModel = cartModel;
        this.userModel = userModel;
        this.productModel = productModel;
    }

    purchaseCart = async (cid, user) => {
        const cartResponse = await this.getById(cid);
        if (cartResponse.status !== 200) {
            throw new Error('Carrito no encontrado');
        }

        const cart = cartResponse.payload;
        if (cart.products.length === 0) {
            return { status: 400, error: 'No hay productos en el carrito para comprar' };
        }

        const userData = user;
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
              
                const quantityUpdated = productStock - requestedQuantity;
                await this.productModel.findByIdAndUpdate(productId, { stock: quantityUpdated }, { new: true });

               
                ticketAmount += requestedQuantity * product.price;

            } else {
              
                await this.productModel.findByIdAndUpdate(productId, { stock: 0 }, { new: true });

              
                const quantityNotPurchased = requestedQuantity - productStock;

               
                const updateResponse = await this.updateProduct(cid, productId, quantityNotPurchased);
                if (updateResponse.status !== 200) {
                    return { status: 500, error: 'Error actualizando la cantidad del producto en el carrito' };
                }

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
            console.log('Ticket creado:', ticketFinished);
            // Enviar correo electrónico de confirmación
            const subject = '¡Tu compra en TodoTienda ha sido exitosa!';

            const productDetails = cart.products.map(item => {
                const productName = item.product.title;
                const quantity = item.qty;
                const price = item.product.price;
                const subtotal = (price * quantity).toFixed(2);

                return `- ${productName} (Cantidad: ${quantity}) - Precio unitario: $${price.toFixed(2)} - Subtotal: $${subtotal}`;
            }).join('\n');

            const text = `
Hola ${userData.firstName},

¡Gracias por tu compra en TodoTienda!

Nos complace informarte que hemos procesado tu pedido con el carrito de compras #${cid} de forma exitosa. A continuación, te proporcionamos un resumen detallado de tu compra:

Productos adquiridos:
${productDetails}

Total de la compra: $${ticketAmount.toFixed(2)}

Los productos adquiridos se procesarán a la brevedad y recibirás un correo con los detalles de envío una vez estén en camino.

Si tienes alguna pregunta o inquietud sobre tu pedido, no dudes en contactarnos respondiendo a este correo.

¡Gracias por confiar en TodoTienda!

Saludos cordiales,
El equipo de TodoTienda
`;

            await sendPurchaseEmail(userData.email, subject, text);

            const clearCartResponse = await this.clearCartProducts(cid);
            if (clearCartResponse.status !== 200) {
                console.error("Error limpiando los productos del carrito:", clearCartResponse.error);
                return { status: 500, error: 'Error limpiando los productos del carrito después de la compra' };
            }

            return { status: 200, payload: ticketFinished };
        }


        return { status: 400, error: 'No se pudo completar la compra, por favor verifique la disponibilidad de los productos' };
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
    
            // Filtrar productos por su ID
            const initialProductCount = cart.products.length;
            cart.products = cart.products.filter(item => String(item.product._id) !== String(productId));
    
            if (initialProductCount === cart.products.length) {
                // Si el número de productos no cambió, significa que el producto no estaba en el carrito
                return { status: 404, error: "Product not found in cart" };
            }
    
            // Guardar los cambios en el carrito
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
