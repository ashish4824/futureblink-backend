const jwt = require('jsonwebtoken');
const User = require('../models/User');
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Create a new user
    const user = new User({ username, email, password });
    // Save the user to the database
    await user.save();
    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' }); 
    // Return the token
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find the user by email
    const user = await User.findOne({ email });
   // Check if the user exists and the password is correct
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Compare the password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.logout = async (req, res) => {
  try {
    // Clear the token from the client
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
