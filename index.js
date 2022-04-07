const express = require('express')
const connectToMongo = require('./database');
const path = require('path');
var cors = require('cors');
require("dotenv").config();

connectToMongo();

const app = express()
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json())

// For Production 
if (process.env.NODE_ENV === "production") {
  const static_path = path.join(__dirname,'client','build');
  app.use(express.static(static_path));
}

// Available Routes
app.use('/', require('./routes/auth'))
app.use('/', require('./routes/notes'))


app.listen(port, () => {
  console.log(`iNotebook backend listening at http://localhost:${port}`)
})