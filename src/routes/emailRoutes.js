const express = require('express');
const emailController = require('../controllers/emailController');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);
// Route for sending an email
router.post('/schedule', emailController.scheduleEmail);
// Route for getting a list of scheduled emails
router.get('/', emailController.getScheduledEmails);
// Route for getting a specific email by ID
router.get('/:id', emailController.getEmailById);
// Route for canceling a scheduled email
router.delete('/:id', emailController.cancelEmail);

module.exports = router;