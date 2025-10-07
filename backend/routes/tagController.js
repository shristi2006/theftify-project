const express = require('express');
const router = express.Router();
const tagModel = require("./tags");
const { isLoggedIn } = require('./userRoutes');

// Get all posts associated with a specific tag
router.get('/:tagName', isLoggedIn, async (req, res, next) => {
    try {
        const tag = await tagModel.findOne({ name: req.params.tagName.toLowerCase() })
            .populate({
                path: 'posts',
                populate: { path: 'user' } // Populate the user for each post
            })
            .exec();

        if (!tag) {
            return res.status(404).send(`No posts found for tag: #${req.params.tagName}`);
        }

        res.render('tagPage', { tagName: tag.name, posts: tag.posts });
    } catch (err) {
        next(err);
    }
});

module.exports = router;