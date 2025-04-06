const transporter = require('../config/nodemailer');
const EmailSchedule = require('../models/EmailSchedule');

module.exports = function(agenda) {
  agenda.define('send email', async (job, done) => {
    try {
      // Get the email schedule object from the database
      const { emailId } = job.attrs.data;
      const emailSchedule = await EmailSchedule.findById(emailId);
      
      if (!emailSchedule) {
        // Handle the case where the email schedule is not found
        console.error(`Email with ID ${emailId} not found`);
        return done(new Error('Email not found'));
      }
      // Send the email using nodemailer
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailSchedule.recipient,
        subject: emailSchedule.subject,
        html: emailSchedule.body
      };
      // Send the email
      await transporter.sendMail(mailOptions);
            emailSchedule.status = 'sent';
      // Save the updated email schedule
            await emailSchedule.save();
      
      console.log(`Email sent to ${emailSchedule.recipient}`);
      done();
    } catch (error) {
      console.error('Error sending email:', error);
      if (job.attrs.data.emailId) {
        try {
          // Update the email schedule status to 'failed'
          const emailSchedule = await EmailSchedule.findById(job.attrs.data.emailId);
          if (emailSchedule) {
            // Update the email schedule status to 'failed'
            emailSchedule.status = 'failed';
            await emailSchedule.save();
          }
        } catch (err) {
          console.error('Error updating email status:', err);
        }
      }
      
      done(error);
    }
  });
};