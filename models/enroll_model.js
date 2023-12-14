const mongoose = require('mongoose');

const enrollSchema = new mongoose.Schema({
  email: { type: String, required: true},
}, { timestamps: true }); // timestamps özelliğini ekleyerek otomatik createdAt ve updatedAt alanlarını ekler

const Enroll = mongoose.model('Enroll', enrollSchema);

module.exports = Enroll;
