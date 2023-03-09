const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

//REGISTER
router.post('/register', async (request, response) => {

  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(request.body.password, salt);

    //create new user
    const newUser = await new User({
      username: request.body.username,
      email: request.body.email,
      password: hashedPassword,
    });

    //save user and respond
    const user = await newUser.save();
    response.status(200).json(user);
  } catch (error) {
    response.status(500).json(error);
  }
})

//LOGIN
router.post('/login', async (request, response) => {
  try {
    const user = await User.findOne({email: request.body.email});
    !user && response.status(404).send('User not found');

    const validPassword = await bcrypt.compare(request.body.password, user.password);
    !validPassword && response.status(400).send('Wrong password');

    response.status(200).json(user);
  } catch (error) {
    response.status(500).json(error);
  }
});

module.exports = router;
