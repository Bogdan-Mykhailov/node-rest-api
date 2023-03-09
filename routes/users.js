const User = require('../models/User')
const bcrypt = require("bcrypt");
const router = require('express').Router();

//update user
router.put('/:id', async (request, response) => {
  if (request.body.userId === request.params.id || request.body.isAdmin) {
    if (request.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        request.body.password = await bcrypt.hash(request.body.password, salt);
      } catch (error) {
        return response.status(500).json(error);
      }
    }

    try {
      const user = await User.findByIdAndUpdate(request.params.id, {
        $set: request.body,
      });
      response.status(200).json('Account has been updated!');
    } catch (error) {
      return response.status(500).json(error);
    }
  } else {
    response.status(403).json('You can update only your account!');
  }
});

//delete user
router.delete('/:id', async (request, response) => {
  if (request.body.userId === request.params.id || request.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(request.params.id);
      response.status(200).json('Account has been deleted!');
    } catch (error) {
      return response.status(500).json(error);
    }
  } else {
    response.status(403).json('You can delete only your account!');
  }
});

//gat a user
router.get('/:id', async (request, response) => {
  try {
    const user = await User.findById(request.params.id);
    const {password, updatedAt, ...rest} = user._doc;
    response.status(200).json(rest);
  } catch (error) {
    return response.status(500).json(error);
  }
});

//follow a user
router.put('/:id/follow', async (request, response) => {
  if (request.body.userId !== request.params.id) {
    try {
      const user = await User.findById(request.params.id);
      const currentUser = await User.findById(request.body.userId);

      if (!user.followers.includes(request.body.userId)) {
        await user.updateOne({
          $push: {
            followers: request.body.userId
          }
        });

        await currentUser.updateOne({
          $push: {
            followings: request.params.id
          }
        });

        response.status(200).json('User has been followed!');
      } else {
        response.status(403).json('You already follow this user!');
      }
    } catch (error) {
      return response.status(500).json(error);
    }
  } else {
    response.status(403).json('You can\'t follow yourself!');
  }
});

//unfollow a user
router.put('/:id/unfollow', async (request, response) => {
  if (request.body.userId !== request.params.id) {
    try {
      const user = await User.findById(request.params.id);
      const currentUser = await User.findById(request.body.userId);

      if (user.followers.includes(request.body.userId)) {
        await user.updateOne({
          $pull: {
            followers: request.body.userId
          }
        });

        await currentUser.updateOne({
          $pull: {
            followings: request.params.id
          }
        });

        response.status(200).json('User has been unfollowed!');
      } else {
        response.status(403).json('You don\'t follow this user!');
      }
    } catch (error) {
      return response.status(500).json(error);
    }
  } else {
    response.status(403).json('You can\'t unfollow yourself!');
  }
});

module.exports = router;
