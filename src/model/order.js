const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    table_number: {
        type: Number,
        required: true,
    },
    order_items: [{
        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            default: mongoose.Types.ObjectId,
            required: true,
        },
        count: {
            type: Number,
            required: true
        }
    }],
    state:{
        type: String,
        default: 'PENDING',
        enum: ['PENDING', 'PREPERING', 'READY', 'CANCELED']
    },
    created_at:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('orderSchema', orderSchema);