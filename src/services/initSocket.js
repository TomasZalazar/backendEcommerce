import { Server } from 'socket.io';
import Message from '../models/chat.model.js';
const initSocket = (httpServer) => {

    const io = new Server(httpServer);

    io.on('connection', client => {
        //chat
        
        console.log(`Cliente conectado, id ${client.id} desde ${client.handshake.address}`);
        
        // Cuando un cliente se conecta, envía al cliente el historial de mensajes
        Message.find().sort({ createdAt: 1 }).then(Message => {
            client.emit('chatLog', Message);
        }).catch(error => {
            console.error('Error al obtener el historial de mensajes:', error);
        });
    
        client.on('newMessage', async (data) => {
            try {
                // Crea un nuevo documento de mensaje usando el modelo de Mongoose
                const newMessage = new Message({ user: data.user, message: data.message });
                // Guarda el nuevo mensaje en la base de datos
                await newMessage.save();
                // Emitir el mensaje a todos los clientes conectados
                io.emit('messageArrived', newMessage);
            } catch (error) {
                console.error('Error al guardar el nuevo mensaje:', error);
            }
        });
        // productos
        client.on('nuevoProducto', (producto) => {
            console.log('Nuevo producto recibido en el servidor:', producto);
            // Realizar acciones con el nuevo producto aquí
        });

        client.on('productoEliminado', (producto) => {
            console.log('Producto eliminado en el servidor:', producto);
            // Realizar acciones con el producto eliminado aquí
            io.emit('productoEliminado',  producto );
        });
    });

    return io;
}

export default initSocket;
