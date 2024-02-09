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
        if (user)
            res.status(400).json({error:"email already registered"});

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
        res.status(500).json({ error: error, message: req.body });
    }
}

async function signIn(req, res) {
    try {
        const { email, password } = req.body;

        // check whether user exist or not
        const user = await userSchema.findOne({ email: email});
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
        }

        // password check
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create and sign the JWT token
        const token = jwt.sign({email: user.email, role: user.role}, process.env.SECRET_KEY, { expiresIn });    
        
        // response
        res.status(200).cookie("token", token, {
            httpOnly: true,
        }).json({email: user.email, role: user.role});

    } catch (error) {
        res.status(500).json({ error: error });
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
        // Handle errors
        console.error('Error:', error.message);
        throw error; // Rethrow the error for the caller to handle
    }
}

module.exports = {
    getUser,
    signIn,
    signUp,
};