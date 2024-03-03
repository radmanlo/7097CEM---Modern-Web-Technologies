const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    number:{
        type: Number,
        required: true,
        unique: true,
    },
    state:{
        type: String,
        required: true,
        default: 'EMPTY',
        enum: ['EMPTY', 'RESERVE', 'ORDERING', 'WAITING_FOR_FOOD', 'DELIVERED']
    },
    // reserveInfo:{
    //     name: {
    //         type: String
    //     },
    //     date: {
    //         type: Date
    //     }
    // }
})

module.exports = mongoose.model('tableSchema', tableSchema);