const mongoose = require('mongoose')

const userDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref:'Users'},
  user_name: {type: String, required: true},
  email: {type: String, required: true},
  phone: {type: String, required: true},
  
})

module.exports = mongoose.model('UserDetails', userDetailsSchema)
