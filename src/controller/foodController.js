const food = require('../model/food');
const foodSchema = require('../model/food');
const {getUser} = require("./authController");

async function createFood (req, res){

    try {
        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);
    
        // Check if the user who is calling is an admin 
        if (user.role !== "ADMIN") {
            return res.status(404).json({ error: 'For Creating a food you should be admin' }); 
        }
    
        const { category, name, ingredients } = req.body;
    
        // Creating a new food instance
        const newFood = new foodSchema({ category, name, ingredients });
    
        // Saving the new food item
        await newFood.save();
    
        res.status(201).json({ newFood });
    } catch (error) {
        if (error.message === 'Invalid token: Email or expiration time not found in token' ||
            error.message === 'Token has expired') {
            return res.status(401).json({ error: error.message }); 
        } else if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        } else if (error.code === 11000) {
            return res.status(409).json({ error: error.message });
        } else {
            return res.status(500).json({ error: error.message }); 
        }
    }
}

async function getAllFoods (req, res){

    try{

        // find the table
        const foods = await foodSchema.find();

        // Return 200 status code
        res.status(200).json({foods});

    }catch (error) {
        if (error.message === 'Invalid token: Email or expiration time not found in token' ||
            error.message === 'Token has expired') {
            res.status(401).json({ error: error.message }); 
        } else if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        } else if (error.code === 11000) {
            return res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message}); 
        }
    }
    
}

async function getFoodByCategory (req, res){

    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);

        // Check if the user who is calling is an admin 
        if (user.role !== "SERVER") {
            return res.status(404).json({ error: 'Only Servers can call this API' }); 
        }

        const categoryIn = req.query.category;
        
        // find the table
        const foods = await foodSchema.find({category: categoryIn});

        // Return 200 status code
        res.status(200).json({foods});

    }catch (error) {
        if (error.message === 'Invalid token: Email or expiration time not found in token' ||
            error.message === 'Token has expired') {
            res.status(401).json({ error: error.message }); 
        } else if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        } else if (error.code === 11000) {
            return res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message}); 
        }
    }
    
}

async function changeState (req, res){

    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);

        // Check the user who is calling is admin or kitchen
        if(user.role != "ADMIN" && user.role != "KITCHEN" ){
            res.status(404).json({ error: 'You should be kitchen or admin staff!' }); 
            return;
        }

        const foodId = req.query.foodId;

        const food = await foodSchema.findById(foodId);

        if (!food) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        // Toggle the state of the food item
        food.state = (food.state === 'AVAILABLE') ? 'UNAVAILABLE' : 'AVAILABLE';

        // Save the updated food item
        const updatedFood = await food.save();

        res.status(200).json({ updatedFood });

    }catch (error) {
        if (error.message === 'Invalid token: Email or expiration time not found in token' ||
            error.message === 'Token has expired') {
            res.status(401).json({ error: error.message }); 
        } else if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        } else if (error.code === 11000) {
            return res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message}); 
        }
    }
}

async function updateFood (req, res){

    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);

        // Check the user who is calling is admin 
        if(user.role != "ADMIN"){
            res.status(404).json({ error: 'For updating a food you should be admin' }); 
            return;
        }

        const {foodId, category, name, ingredients} = req.body;

        // Construct the update object based on the optional fields
        const updateObject = {};
        if (ingredients) updateObject.ingredients = ingredients;
        if (category) updateObject.category = category;
        if (name) updateObject.name = name;

        // Find the food item by ID and update it with the specified fields
        const updatedFood = await foodSchema.findByIdAndUpdate(foodId, updateObject, { new: true });

        if (!updatedFood) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        res.status(200).json({ updatedFood });


    }catch (error) {
        if (error.message === 'Invalid token: Email or expiration time not found in token' ||
            error.message === 'Token has expired') {
            res.status(401).json({ error: error.message }); 
        } else if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        } else if (error.code === 11000) {
            return res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message}); 
        }
    }
    
}

async function deleteFood (req, res){

    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);

        // Check the user who is calling is admin 
        if(user.role != "ADMIN"){
            res.status(404).json({ error: 'For deleting a food you should be admin' }); 
            return;
        }

        const foodId = req.query.foodId;

        // Delete the table
        const result = await foodSchema.deleteOne({_id: foodId});

        if (result.deletedCount === 1) {
            res.status(200).json({message: "Food deleted successfully"});
            return;
        } 
        res.status(400).json({error: "Food not found!"});

    }catch (error) {
        if (error.message === 'Invalid token: Email or expiration time not found in token' ||
            error.message === 'Token has expired') {
            res.status(401).json({ error: error.message }); 
        } else if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        } else if (error.code === 11000) {
            return res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message}); 
        }
    }

    

}



module.exports = {
    createFood,
    getAllFoods,
    getFoodByCategory,
    changeState,
    updateFood,
    deleteFood
};