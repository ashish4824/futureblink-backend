jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    verify: jest.fn().mockImplementation(callback => callback(null, true)),
    sendMail: jest.fn().mockImplementation((mailOptions, callback) => {
      if (callback) {
        callback(null, { response: 'Success' });
      }
      return Promise.resolve({ response: 'Success' });
    })
  })
}));