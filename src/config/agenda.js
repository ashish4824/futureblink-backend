const Agenda = require('agenda');
const mongoose = require('mongoose');
// Connect to MongoDB
const agenda = new Agenda({
  db: {
    address: process.env.MONGODB_URI,
    collection: 'agendaJobs'
  },
  processEvery: '30 seconds'
});
// Define jobs
require('../jobs/emailJob')(agenda);
const startAgenda = async () => {
  await agenda.start();
  console.log('Agenda started');
};

module.exports = { agenda, startAgenda };