const app = require('./app');
const connectDB = require('./config/db');
const { startAgenda } = require('./config/agenda');
const PORT = process.env.PORT || 3000;
connectDB()
  .then(() => {
    return startAgenda();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });