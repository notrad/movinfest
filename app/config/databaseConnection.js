const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

class Database {
  constructor() {
    this._connect();
  }

  _connect() {
    //database connection
    mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true })
    .then((data) => {
      console.log(`Database connection successful to: ${process.env.DATABASE_URL}`);
    })
    .catch(err => {
      console.log('Connection to Database failed: '+ err);
    });
  }
}

module.exports = Database;
