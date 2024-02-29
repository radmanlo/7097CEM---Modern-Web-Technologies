const userSchema = require('../model/userSchema');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const expiresIn = '7d';

async function signUp(req, res) {
    try {
        const {name, email, password} = req.body;

        // check whether email exist or not 
        const user = await userSchema.findOne({ email: email});
        if (user){
            res.status(409).json({error:"email already registered"});
            return;
        }

        // save intot the database
        const newUser = new userSchema({ name, email, password});
        await newUser.save();

        // Create and sign the JWT token
        const token = jwt.sign({email: newUser.email}, process.env.SECRET_KEY, {expiresIn});

        // response
        res.status(200).cookie('token',token,{
            httpOnly: true,
        }).json({email: newUser.email});

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        } else if (error.code === 11000) {
            return res.status(404).json({ error: error.message });
        }else{
            res.status(500).json({ error: error.message });
        }
    }
}

async function signIn(req, res) {
    try {
        const { email, password } = req.body;

        // check whether user exist or not
        const user = await userSchema.findOne({ email: email});
        if (!user) {
            res.status(409).json({ error: 'Invalid credentials' });
            return
        }

        // password check
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            res.status(409).json({ error: 'Invalid credentials' });
            return;
        }

        // check it has rol or not
        if (user.role == undefined) {
            res.status(400).json({ error: 'Role not specified' });
            return;
        }

        // Create and sign the JWT token
        const token = jwt.sign({email: user.email, role: user.role}, process.env.SECRET_KEY, { expiresIn });    
        
        // response
        res.status(200).cookie("token", token, {
            httpOnly: true,
        }).cookie("user_name", user.name)
            .json({name: user.name, role: user.role});

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        } else if (error.code === 11000) {
            return res.status(409).json({ error: error.message });
        }else{
            res.status(500).json({ error: error.message });
        }
    }
}

async function getUser(token) {
    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Check if the decoded token contains the email and expiration time
        if (!decoded || !decoded.email || !decoded.exp) {
            throw new Error('Invalid token: Email or expiration time not found in token');
        }

        // Check if the token has expired
        const currentTimestamp = Math.floor(Date.now() / 1000); 
        if (decoded.exp < currentTimestamp) {
            throw new Error('Token has expired');
        }

        // Check if the email exists in the database
        const user = await userSchema.findOne({ email: decoded.email });
        if (!user) {
            throw new Error('User not found in the database');
        }

        // Return the email and role
        return { name: user.name, email: user.email, role: user.role };

    } catch (error) {
        console.error('Error:', error.message);
        throw error; 
    }
}

module.exports = {
    getUser,
    signIn,
    signUp,
};