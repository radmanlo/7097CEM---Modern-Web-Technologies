const {getUser} = require("./authController");

async function userRoleChanger (req, res){

    try{

        // Get token 
        const token = req.cookies.token;
        const user = await getUser(token);

        // Check admin user is calling api 
        if(user.role != "ADMIN"){
            res.status(404).json({ error: 'For Creating a table you should be admin' }); 
            return;
        }

        const {user_email, role} = req.body;

        // check whether user exist or not
        const found_user = await userSchema.findOne({ email: user_email});
        if (!found_user) {
            res.status(409).json({ error: 'Invalid credentials' });
            return
        }

        found_user.role = role;
        table.save();

        // Return 200 status code
        res.status(200).json({message: "Table state updated successfully"});

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
    userRoleChanger
};