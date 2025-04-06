const mongoose = require('mongoose');

const emailScheduleSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'sent', 'cancelled', 'failed'],
    default: 'scheduled'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailSchedule', emailScheduleSchema);