const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    category:{
        type: String,
        enum: ['BEVERAGE', 'APPETIZER', 'FOOD', 'DESSERT'],
        required: true,
    }, 
    name: {
        type: String,
        required: true,
    },
    ingredients: {
        type: Object,
    },
    state: {
        type: String,
        enum: ['AVAILABLE', 'UNAVAILABLE'],
        default: 'AVAILABLE'
    }
});

module.exports = mongoose.model('foodSchema', foodSchema);