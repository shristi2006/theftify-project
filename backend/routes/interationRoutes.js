const express = require('express');
const router = express.Router();
const postModel = require("./posts");
const userModel = require("./users");
const commentModel = require("./comments");
const { isLoggedIn } = require('./userRoutes');


router.post('/like/:postId', isLoggedIn, async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const userId = req.user._id;

        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user has already liked the post
        const index = post.likes.indexOf(userId);

        if (index === -1) {
            // User hasn't liked it -> ADD like (Push ID)
            post.likes.push(userId);
            await post.save();
            res.json({ liked: true, message: "Post liked successfully" });
        } else {
            // User has liked it -> REMOVE like (Pull ID)
            post.likes.splice(index, 1);
            await post.save();
            res.json({ liked: false, message: "Post unliked successfully" });
        }
    } catch (err) {
        next(err);
    }
});

// ------------------------------------
// FOLLOWING A USER
// ------------------------------------

router.post('/follow/:targetUserId', isLoggedIn, async (req, res, next) => {
    try {
        const targetUserId = req.params.targetUserId;
        const currentUserId = req.user._id;

        // Prevent self-following
        if (targetUserId.toString() === currentUserId.toString()) {
            return res.status(400).json({ message: "Cannot follow yourself" });
        }

        // Find both users simultaneously for efficiency
        const [currentUser, targetUser] = await Promise.all([
            userModel.findById(currentUserId),
            userModel.findById(targetUserId)
        ]);

        if (!targetUser) {
            return res.status(404).json({ message: "Target user not found" });
        }

        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            // UNFOLLOW
            currentUser.following.pull(targetUserId); // Remove from current user's 'following' list
            targetUser.followers.pull(currentUserId); // Remove from target user's 'followers' list
            await Promise.all([currentUser.save(), targetUser.save()]);
            res.json({ followed: false, message: "Unfollowed successfully" });
        } else {
            // FOLLOW
            currentUser.following.push(targetUserId); // Add to current user's 'following' list
            targetUser.followers.push(currentUserId); // Add to target user's 'followers' list
            await Promise.all([currentUser.save(), targetUser.save()]);
            res.json({ followed: true, message: "Followed successfully" });
        }

    } catch (err) {
        next(err);
    }
});


// ------------------------------------
// ADDING A COMMENT
// ------------------------------------

router.post('/comment/:postId', isLoggedIn, async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const { text } = req.body;
        const userId = req.user._id;

        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // 1. Create the Comment document
        const newComment = await commentModel.create({
            user: userId,
            post: postId,
            text: text
        });

        // 2. Add the comment ID to the Post's comments array
        post.comments.push(newComment._id);
        await post.save();

        res.redirect(`/post/${postId}`); // Redirect back to the post detail page
    } catch (err) {
        next(err);
    }
});


module.exports = router;