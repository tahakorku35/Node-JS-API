const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true},
}, { timestamps: true }); // timestamps özelliğini ekleyerek otomatik createdAt ve updatedAt alanlarını ekler

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

module.exports = Subscriber;
