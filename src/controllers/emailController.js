const EmailSchedule = require('../models/EmailSchedule');
const { agenda } = require('../config/agenda');
exports.scheduleEmail = async (req, res) => {
  try {
    // Validate the request body
    const { recipient, subject, body, scheduledTime } = req.body;
    if (!recipient || !subject || !body) {
      return res.status(400).json({ message: 'Recipient, subject, and body are required' });
    }
    // Create a new email schedule object
    const emailSchedule = new EmailSchedule({
      recipient,
      subject,
      body,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : new Date(Date.now() + 60 * 60 * 1000),
      createdBy: req.user._id
    });
    // Save the email schedule object to the database
    await emailSchedule.save();
        await agenda.schedule(
      emailSchedule.scheduledTime,
      'send email',
      { emailId: emailSchedule._id.toString() }
    );
    
    res.status(201).json({
      message: 'Email scheduled successfully',
      emailSchedule
    });
  } catch (error) {
    console.error('Email scheduling error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getScheduledEmails = async (req, res) => {
  try {
    // Fetch all email schedules from the database
    const emails = await EmailSchedule.find({ createdBy: req.user._id })
      .sort({ scheduledTime: 1 });
    // Return the email schedules
    res.status(200).json({ emails });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getEmailById = async (req, res) => {
  try {
    // Fetch the email schedule from the database
    const email = await EmailSchedule.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }
    
    res.status(200).json({ email });
  } catch (error) {
    console.error('Error fetching email:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelEmail = async (req, res) => {
  try {
    // Fetch the email schedule from the database
    const email = await EmailSchedule.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      status: 'scheduled'
    });
    
    if (!email) {
      return res.status(404).json({ message: 'Email not found or already sent' });
    }
    // Cancel the email job
        await agenda.cancel({ 'data.emailId': email._id.toString() });    
    email.status = 'cancelled';
    // Save the updated email schedule
    await email.save();
    
    res.status(200).json({ message: 'Email cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling email:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
