const order = require("../model/order");
const orderSchema = require("../model/order");
const {getUser} = require("./authController");
const Food = require('../model/food');

async function createOrder (req, res){

    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);

        // Check the user who is calling is admin 
        if(user.role != "SERVER"){
            res.status(404).json({ error: 'For Creating a Order you should be server' }); 
            return;
        }

        const { table_number, order_items } = req.body;

        const newOrder = new orderSchema({table_number, order_items});
        await newOrder.save();

        res.status(201).json({newOrder});

    }catch (error) {
        if (error.message === 'Invalid token: Email or expiration time not found in token' ||
            error.message === 'Token has expired') {
            res.status(401).json({ error: error.message }); 
        } else if (error.message === 'User not found in the database') {
            res.status(404).json({ error: error.message }); 
        } else if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        } else if (error.code === 11000) {
            return res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message}); 
        }
    }
}

async function getOrderByTableNumber (req, res){

    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);

        // Check the user who is calling is admin 
        if(user.role != "SERVER"){
            res.status(404).json({ error: 'For getting based on table you should be server' }); 
            return;
        }

        const { tableNumber } = req.query;

        const mostRecentOrder = await orderSchema
            .findOne({ table_number: tableNumber})
            .populate({
                path: 'order_items.foodId',
                select: 'name' 
            })
            .sort({ created_at: -1 }) 
            .exec();

        if (!mostRecentOrder) {
            return res.status(404).json({ error: 'No orders found for the specified table number.' });
        }

        return res.status(200).json(mostRecentOrder);

    }catch (error) {
        if (error.message === 'Invalid token: Email or expiration time not found in token' ||
            error.message === 'Token has expired') {
            return res.status(401).json({ error: error.message }); 
        } else if (error.message === 'User not found in the database') {
            return res.status(404).json({ error: error.message }); 
        } else if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        } else if (error.code === 11000) {
            return res.status(409).json({ error: error.message });
        } else {
            return res.status(500).json({ error: error.message}); 
        }
    }
    
}

async function getOrderKitchen (req, res){
    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);

        // Check the user who is calling is admin 
        if(user.role != "KITCHEN"){
            res.status(404).json({ error: 'For getting based on state you should be kitchen' }); 
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        // const ordersToday = await orderSchema.find({
        //     created_at: { $gte: today }
        // }).sort({ created_at: 1 }).exec();

        const ordersToday = await orderSchema.find({
            created_at: { $gte: today }
        }).populate({
            path: 'order_items.foodId',
            select: 'name' 
        }).sort({ created_at: 1 }).exec();


        if (!ordersToday) {
            return res.status(404).json({ error: 'No orders found for the specified state.' });
        }

        const orders = ordersToday.map(order => {
            return {
                tableNumber: order.table_number,
                orderId: order._id, 
                orderItems: order.order_items.map(item => ({
                    foodName: item.foodId.name,
                    count: item.count
                })),
                state: order.state,
                createdAt: order.created_at
            };
        });

        return res.status(200).json(orders);

    }catch (error) {
        if (error.message === 'Invalid token: Email or expiration time not found in token' ||
            error.message === 'Token has expired') {
            res.status(401).json({ error: error.message }); 
        } else if (error.message === 'User not found in the database') {
            res.status(404).json({ error: error.message }); 
        } else if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        } else if (error.code === 11000) {
            return res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message}); 
        }
    }
}

async function updateState (req, res){

    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);

        // Check the user who is calling is admin 
        if(user.role != "KITCHEN"){
            res.status(404).json({ error: 'For getting based on state you should be kitchen' }); 
            return;
        }

        const { orderId } = req.query;

        const order = await orderSchema.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'No orders found' });
        }

        if(order.state == 'PENDING'){
            order.state = 'PREPARING'
            const updatedOrder = await order.save();
            return  res.status(200).json({ updatedOrder });
        }
        else if (order.state == 'PREPARING'){
            order.state = 'READY'
            const updatedOrder = await order.save();
            return  res.status(200).json({ updatedOrder });
        }

        return res.status(400).json({ error: "Updated was unsuccessful" });

    }catch (error) {
        if (error.message === 'Invalid token: Email or expiration time not found in token' ||
            error.message === 'Token has expired') {
            res.status(401).json({ error: error.message }); 
        } else if (error.message === 'User not found in the database') {
            res.status(404).json({ error: error.message }); 
        } else if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        } else if (error.code === 11000) {
            return res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message}); 
        }
    }
}

async function cancelOrder(req, res){
    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);

        // Check the user who is calling is admin 
        if(user.role != "SERVER" && user.role != "KITCHEN"){
            
            res.status(404).json({ error: `For canceling order on state you should be server or kitchen staff ${user.role}` }); 
            return;
        }

        const { orderId } = req.query;

        const order = await orderSchema.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'No orders found' });
        }

        if(order.state == 'PENDING'){
            order.state = 'CANCELED'
            const updatedOrder = await order.save();
            return res.status(200).json({ updatedOrder });
        }

        return res.status(400).json({ error: "Too late for cancelation your food is getting ready" });

    }catch (error) {
        if (error.message === 'Invalid token: Email or expiration time not found in token' ||
            error.message === 'Token has expired') {
            res.status(401).json({ error: error.message }); 
        } else if (error.message === 'User not found in the database') {
            res.status(404).json({ error: error.message }); 
        } else if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message });
        } else if (error.code === 11000) {
            res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message}); 
        }
    }
}


module.exports = {
    createOrder,
    getOrderByTableNumber,
    getOrderKitchen,
    updateState,
    cancelOrder
};