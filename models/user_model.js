const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: { type: String, required: true},
  phone: { type: String, required: true},
  password: { type: String, required: true},
  token: { type: String, required: false, default: null},
})

module.exports = mongoose.model('User', userSchema)