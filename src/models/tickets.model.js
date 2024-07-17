import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
mongoose.pluralize(null);

const collection = 'tickets';

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        default: () => uuidv4(),
    },
    amount: {
        type: Number,
        required: true,
    },
    purchaser: {
        type: String,
        required: true,
    },
}, { timestamps: true });



const TicketModel = mongoose.model(collection, ticketSchema);

export default TicketModel;