const tableSchema = require("../model/table");
const {getUser} = require("./authController");

async function createTable(req, res) {

    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);

        // Check the user who is calling is admin 
        if(user.role != "ADMIN"){
            res.status(404).json({ error: 'For Creating a table you should be admin' }); 
            return;
        }

        const number = req.query.number;
        const capacity = req.query.capacity;
        
        // Create new table
        const newTable = new tableSchema({number, capacity});
        await newTable.save();

        // Return 200 status code
        res.status(201).json({message: "Table created!"});

    } catch (error) {
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

async function getAllTables(req, res) {
    
    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);

        // Check the user who is calling is welcome or admin
        if(user.role != "SERVER" && user.role != "WELCOME"){
            res.status(404).json({ error: 'For getting tables you should be Welcome or Server staff'}); 
            return;
        }

        // find the table
        const tables = await tableSchema.find();

        // Return 200 status code
        res.status(200).json({tables});

    } catch (error) {
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

async function changeStateTable(req, res){

    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);

        // Check the user who is calling is welcome or admin
        if(user.role != "SERVER" && user.role != "WELCOME"){
            res.status(404).json({ error: 'For changing the state of a table you should be server, Welcome or admin staff'}); 
            return;
        }

        const number = req.query.number;

        // find the table
        const table = await tableSchema.findOne({ number });

        // Check if the table exists
        if (!table) {
            res.status(404).json({ error: "Invalid table number" }); 
            return;
        }

        if (table.state === "EMPTY"){
            
            table.state = "ORDERING";
            table.save();

            // Return 200 status code
            res.status(200).json({message: "Table state updated successfully"});
            return;
        }
        else if (table.state === "ORDERING"){

            table.state = "WAITING_FOR_FOOD";
            table.save();

            // Return 200 status code
            res.status(200).json({message: "Table state updated successfully"});
            return;
        }
        else if (table.state === "ORDERING"){

            table.state = "WAITING_FOR_FOOD";
            table.save();

            // Return 200 status code
            res.status(200).json({message: "Table state updated successfully"});
            return;
        }
        else if (table.state === "WAITING_FOR_FOOD"){

            table.state = "DELIVERED";
            table.save();

            // Return 200 status code
            res.status(200).json({message: "Table state updated successfully"});
            return;
        }

        res.status(400).json({message: "Bad Request"});

    } catch (error) {
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

async function makeTableEmpty(req, res){

    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);

        // Check the user who is calling is welcome or admin
        if(user.role != "WELCOME" ){
            res.status(404).json({ error: 'For emptying a table you should be Welcome or admin staff'}); 
            return;
        }

        const number = req.query.number;

        // find the table
        const table = await tableSchema.findOne({ number });

        // Check if the table exists
        if (!table) {
            res.status(404).json({ error: "Invalid table number" }); 
        }

        // Change the table state
        table.state = "EMPTY";
        table.save();

        // Return 200 status code
        res.status(200).json({message: "Table state updated successfully"});

    } catch (error) {
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

async function deleteTable(req, res){

    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);

        // Check the user who is calling is admin 
        if(user.role != "ADMIN"){
            res.status(404).json({ error: 'For emptying a table you should be a admin staff'}); 
            return;
        }

        const number = req.query.number;

        // Delete the table
        const result = await tableSchema.deleteOne({number: number});

        if (result.deletedCount === 1) {
            res.status(200).json({message: "Table deleted successfully"});
            return;
        } 

        res.status(400).json({error: "Table not found!"});

    } catch (error) {
        if (error.message === 'Invalid token: Email or expiration time not found in token' ||
            error.message === 'Token has expired') {
            res.status(401).json({ error: error.message }); 
        } else if (error.message === 'User not found in the database') {
            res.status(404).json({ error: error.message }); 
        } else if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        } else if (error.name === 'MongoError' || error.code === 11000) {
            return res.status(409).json({ error: error.message });
        } else {
            return res.status(500).json({ error: error.message}); 
        }
    }
}

module.exports = {
    createTable,
    getAllTables,
    changeStateTable,
    makeTableEmpty,
    deleteTable
};