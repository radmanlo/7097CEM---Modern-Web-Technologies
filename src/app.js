const express = require('express')
const path = require('path'); 
require('dotenv').config();

const db = require("./config/db")

const authRoutes = require('./route/authRouter');
const tableRoutes = require('./route/tableRouter');
const adminRoutes = require('./route/adminRouter');
const foodRoutes = require ('./route/foodRouter');
const orderRoutes = require('./route/orderRouter')

const app = express()
const cookieParser = require('cookie-parser');

const uri = process.env.DATABASE_URI;
const port = process.env.port || 8080;
// const port = process.env.NODE_LOCAL_PORT;

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/table', tableRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/order', orderRoutes);

app.use(express.static(path.join(__dirname, 'public/')));

// Route for the root URL
app.get('/', function(req, res){
  // Send the signup.html file
  res.sendFile(path.join(__dirname, 'public/signup/signup.html'));
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    db.connect(uri);
  });
}

module.exports = app