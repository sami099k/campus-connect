const mongoose = require('mongoose');

let isConnected = false;

async function connectDB(uri) {
  mongoose.connect(uri).then(()=>{console.log('connected to db')})
  .catch((err)=>{console.log(err)})
}

module.exports = { connectDB };
