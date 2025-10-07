// routes/postRoutes.js
import express from 'express';
import postModel from "../models/posts.js";
import userModel from "../models/users.js";
import tagModel from "../models/tags.js";
import commentModel from "../models/comments.js";
import { isLoggedIn } from './userRoutes.js'; // Import the middleware

const router = express.Router();

// ------------------------------------
// POST CREATION
// ------------------------------------

// GET route to show the creation form (assuming an EJS file)
router.get('/create', isLoggedIn, (req, res) => {
    res.render('createPost', { title: 'Create Post' });
});

router.post('/create', isLoggedIn, async (req, res, next) => {
    // Assuming type, caption, content, tagsString, and imageUrl are submitted via form/API
    const { type, caption, content, tagsString, imageUrl } = req.body; 

    try {
        const user = req.user; 

        // 1. Create Post
        const newPost = await postModel.create({
            user: user._id,
            type: type,
            caption: caption,
            content: content,
            imageUrl: imageUrl // Placeholder for actual image URL/path
        });

        // 2. Handle Tags
        const tagsArray = tagsString ? tagsString.split(',').map(tag => tag.trim().toLowerCase()).filter(t => t.length > 0) : [];
        const tagObjectIds = [];

        for (const tagName of tagsArray) {
            let tag = await tagModel.findOneAndUpdate(
                { name: tagName },
                { $setOnInsert: { name: tagName } },
                { upsert: true, new: true } 
            );

            // Link post to tag
            if (!tag.posts.includes(newPost._id)) {
                tag.posts.push(newPost._id);
                await tag.save();
            }
            tagObjectIds.push(tag._id);
        }

        // 3. Finalize Post & User
        newPost.tags = tagObjectIds;
        await newPost.save();
        user.posts.push(newPost._id);
        await user.save();

        res.redirect(`/post/${newPost._id}`); 
    } catch (err) {
        next(err);
    }
});

// ------------------------------------
// POST READ & FEED
// ------------------------------------

router.get('/feed', isLoggedIn, async (req, res, next) => {
    try {
        const posts = await postModel.find({})
            .sort({ createdAt: -1 })
            .populate('user')
            .populate('tags')
            .limit(50) 
            .exec();
        
        res.render('feed', { posts, title: 'Home Feed' });
    } catch (err) {
        next(err);
    }
});

router.get('/:postId', isLoggedIn, async (req, res, next) => {
    try {
        const post = await postModel.findById(req.params.postId)
            .populate('user')
            .populate('tags')
            .populate({ path: 'comments', populate: { path: 'user' } })
            .exec();

        if (!post) {
            return res.status(404).render('error', { title: '404', message: "Post not found." });
        }

        res.render('postDetail', { post, title: post.title || post.caption || 'Post' });
    } catch (err) {
        next(err);
    }
});

// ------------------------------------
// TAG ROUTE
// ------------------------------------

router.get('/tag/:tagName', isLoggedIn, async (req, res, next) => {
    try {
        const tag = await tagModel.findOne({ name: req.params.tagName.toLowerCase() })
            .populate({ path: 'posts', populate: { path: 'user' } })
            .exec();

        if (!tag) {
            return res.status(404).render('error', { title: '404', message: `No posts found for tag: #${req.params.tagName}` });
        }

        res.render('tagPage', { tagName: tag.name, posts: tag.posts, title: `#${tag.name}` });
    } catch (err) {
        next(err);
    }
});

// ------------------------------------
// INTERACTION ROUTES (Liking and Commenting)
// ------------------------------------

router.post('/:postId/like', isLoggedIn, async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const userId = req.user._id;

        const post = await postModel.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const index = post.likes.indexOf(userId);

        if (index === -1) {
            post.likes.push(userId); // ADD like
            await post.save();
            return res.json({ liked: true, message: "Post liked" });
        } else {
            post.likes.splice(index, 1); // REMOVE like
            await post.save();
            return res.json({ liked: false, message: "Post unliked" });
        }
    } catch (err) {
        next(err);
    }
});

router.post('/:postId/comment', isLoggedIn, async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const { text } = req.body;
        const userId = req.user._id;

        if (!text) return res.status(400).json({ message: "Comment text is required" });

        const post = await postModel.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // 1. Create Comment
        const newComment = await commentModel.create({
            user: userId,
            post: postId,
            text: text
        });

        // 2. Link comment to Post
        post.comments.push(newComment._id);
        await post.save();

        res.redirect(`/post/${postId}`); 
    } catch (err) {
        next(err);
    }
});

// ------------------------------------
// USER FOLLOW/UNFOLLOW (Technically Interaction but involves Users)
// ------------------------------------

router.post('/user/:targetUserId/follow', isLoggedIn, async (req, res, next) => {
    try {
        const targetUserId = req.params.targetUserId;
        const currentUserId = req.user._id;

        if (targetUserId.toString() === currentUserId.toString()) {
            return res.status(400).json({ message: "Cannot follow yourself" });
        }

        const [currentUser, targetUser] = await Promise.all([
            userModel.findById(currentUserId),
            userModel.findById(targetUserId)
        ]);

        if (!targetUser) return res.status(404).json({ message: "Target user not found" });

        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            // UNFOLLOW
            currentUser.following.pull(targetUserId);
            targetUser.followers.pull(currentUserId);
            await Promise.all([currentUser.save(), targetUser.save()]);
            res.json({ followed: false, message: "Unfollowed" });
        } else {
            // FOLLOW
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);
            await Promise.all([currentUser.save(), targetUser.save()]);
            res.json({ followed: true, message: "Followed" });
        }
    } catch (err) {
        next(err);
    }
});

export default router;