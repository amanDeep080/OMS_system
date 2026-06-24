const { Post, Comment, Reaction, Kudos, Employee } = require('../models');

async function listPosts(req, res) {
  try {
    const posts = await Post.findAll({
      include: [
        { model: Employee, as: 'author', attributes: ['firstName', 'lastName', 'profilePicture'] },
        {
          model: Comment, as: 'comments',
          include: [{ model: Employee, as: 'author', attributes: ['firstName', 'lastName'] }]
        },
        { model: Reaction, as: 'reactions' }
      ],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createPost(req, res) {
  try {
    const post = await Post.create({
      ...req.body,
      employeeId: req.user.employeeId
    });
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function listRecognitions(req, res) {
  try {
    const recognitions = await Kudos.findAll({
      include: [
        { model: Employee, as: 'giver', attributes: ['firstName', 'lastName'] },
        { model: Employee, as: 'receiver', attributes: ['firstName', 'lastName', 'profilePicture'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json({ success: true, data: recognitions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createKudos(req, res) {
  try {
    const kudos = await Kudos.create({
      ...req.body,
      giverId: req.user.employeeId
    });
    res.status(201).json({ success: true, data: kudos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { listPosts, createPost, listRecognitions, createKudos };
