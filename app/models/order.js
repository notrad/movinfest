const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    customerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
                },
    items: { type: Object, required: true },
    guests: { type: String, required: true },
    eventtype: { type: String, required: true },
    datetime: { type: String, required: true },
    phone: { type: String, required: true},
    address: { type: String, required: true},
    customization: { type: String, required: true},
    paymentType: { type: String, default: 'COD'},
    paymentStatus: { type: Boolean, default: false },
    status: { type: String, default: 'order_placed'},
    feedback: { type: String, default: 'not_submitted'},
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
