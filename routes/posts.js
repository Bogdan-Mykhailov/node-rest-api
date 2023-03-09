const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');

//create a post
router.post('/', async (request, response) => {
  const newPost = new Post(request.body);

  try {
    const savedPost = await newPost.save();
    response.status(200).json(savedPost);
  } catch (error) {
    response.status(500).json(error);
  }
});

//update a post
router.put('/:id', async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);
    if (post.userId === request.body.userId) {
      await post.updateOne({
        $set: request.body
      });

      response.status(200).json('The post has been updated!');
    } else {
      return response.status(403).json('You can update only your post!');
    }
  } catch (error) {
    response.status(500).json(error);
  }
});

//delete a post
router.delete('/:id', async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);
    if (post.userId === request.body.userId) {
      await post.deleteOne();

      response.status(200).json('The post has been deleted!');
    } else {
      return response.status(403).json('You can delete only your post!');
    }
  } catch (error) {
    response.status(500).json(error);
  }
});

//like | dislike a post
router.put('/:id/like', async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);
    if (!post.likes.includes(request.body.userId)) {
      await post.updateOne({
        $push: {
          likes: request.body.userId
        }
      });
      response.status(200).json('The post has been liked!');
    } else {
      await post.updateOne({
        $pull: {
          likes: request.body.userId
        }
      });
      response.status(200).json('The post has been disliked!');
    }
  } catch (error) {
    response.status(500).json(error);
  }
});

//get a post
router.get('/:id', async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);
    response.status(200).json(post);
  } catch (error) {
    response.status(500).json(error);
  }
});

//get timeline posts
router.get('/timeline/all', async (request, response) => {
  try {
    const currentUser = await User.findById(request.body.userId);
    const userPosts = await Post.find({userId: currentUser._id});
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({userId: friendId});
      })
    );
    response.json(userPosts.concat(...friendPosts));
  } catch (error) {
    response.status(500).json(error);
  }
});

module.exports = router;
