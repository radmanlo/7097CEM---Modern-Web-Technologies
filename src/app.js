const express = require('express')
require('dotenv').config();

const db = require("./config/db")
const authRoutes = require('./route/auth');

const app = express()

const uri = process.env.DATABASE_URI;
const port = process.env.NODE_LOCAL_PORT;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  db.connect(uri)
})