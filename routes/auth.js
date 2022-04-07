const express = require('express');
const User = require('../models/User');
const router = express.Router();
var fetchuserId = require('../middleware/fetchuser');

const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ashishkumarguptacse2023';

// ROUTE 1: Create a User using: POST "/signup".
router.post('/signup', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }
  try {
    // Check whether the user with this email exists already
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: "Sorry a user with this email already exists" })
    }
    // const salt = await bcrypt.genSalt(10);
    // const secPass = await bcrypt.hash(req.body.password, salt);
    const secPass = await bcrypt.hash(req.body.password, 10);

    // Create a new user
    user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email,
    });

    success = true;
    res.json({ success });
  } catch (error) {
    res.status(500).json({ "Server Error": error.message });
  }
})

// ROUTE 2: Authenticate a User using: POST "/login".
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
  let success = false;

  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const user_id = user.id;
    //Creating Unique web token from Logged in user id
    const webtoken = jwt.sign(user_id, JWT_SECRET);

    success = true;
    res.json({ success, webtoken })

  } catch (error) {
    res.status(500).json({ "Server Error": error.message });
  }
})

// ROUTE 3: Get Loggedin User Details using: POST "/api/auth/getuser". Login required
router.get('/getuser', fetchuserId, async (req, res) => {
  try {
    const userId = req.userId;
    const userDetails = await User.findById(userId);
    res.send(userDetails)
  } catch (error) {
    res.status(500).json({ "Server Error": error.message });
  }
});
module.exports = router