const express = require('express')
require('dotenv').config();

const db = require("./config/db")
const authRoutes = require('./route/authRouter');
const tableRoutes = require('./route/tableRouter');

const app = express()
const cookieParser = require('cookie-parser');

const uri = process.env.DATABASE_URI;
const port = process.env.NODE_LOCAL_PORT;

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/table', tableRoutes);
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/signup', function(req, res){
  res.sendFile(__dirname + '/public/signup/singup.html')
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    db.connect(uri);
  });
}

module.exports = app