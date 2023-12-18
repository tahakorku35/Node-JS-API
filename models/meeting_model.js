const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email:{ type: String, required: true },
  date1: { type: Date, required: true },
  
});

const Meeting = mongoose.model('Meeting', MeetingSchema);
module.exports = Meeting;
