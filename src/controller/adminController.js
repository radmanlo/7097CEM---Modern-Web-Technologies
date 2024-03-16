const {getUser} = require("./authController");
const userSchema = require('../model/user');

async function userRoleChanger (req, res){

    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);

        // Check admin user is calling api 
        if(user.role != "ADMIN"){
            res.status(404).json({ error: 'For changing user roll you should be admin' }); 
            return;
        }

        const {email, role} = req.body;

        // check whether user exist or not
        const found_user = await userSchema.findOne({ email: email});
        if (!found_user) {
            res.status(409).json({ error: 'Invalid email' });
            return
        }

        found_user.role = role;
        found_user.save();

        // Return 200 status code
        res.status(200).json({message: "User role updated successfully"});

    } catch (error) {
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

async function getUsers(req, res){

    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);

        // Check admin user is calling api 
        if(user.role != "ADMIN"){
            res.status(404).json({ error: 'For getting users you should be admin' }); 
            return;
        }

        const found_users = await userSchema.find();
        
        res.status(200).json({found_users});
         

    } catch (error) {
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

async function deleteUser(req, res){

    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);
 
        // Check admin user is calling api 
        if(user.role != "ADMIN"){
            res.status(404).json({ error: 'For deleting a user you should be admin' }); 
            return;
        }

        const user_email = req.query.email

        const found_user = await userSchema.findOneAndDelete({email: user_email});
        if (!found_user) {
            res.status(409).json({ error: 'Invalid email' });
            return
        }

        res.status(200).json({message: "Deleted Successfully!"});
         

    } catch (error) {
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
    userRoleChanger,
    getUsers,
    deleteUser
};