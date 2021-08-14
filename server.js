const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");
require('dotenv').config();

const PORT = 3000;

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/budget", {
  useNewUrlParser: true,
  useFindAndModify: false
});

// routes
app.use(require("./routes/api.js"));

const db = mongoose.connection;

db.on('error', (error) => console.error(error));
db.once('open', () => {
  console.log('Connected To Database');
  app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
  })
});

// app.listen(PORT, () => {
//   console.log(`App running on port ${PORT}!`);
// });