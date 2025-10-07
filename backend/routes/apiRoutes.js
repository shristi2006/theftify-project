import express from 'express';
import postModel from '../models/posts.js';
import userModel from '../models/users.js';
import tagModel from '../models/tags.js';
import { isLoggedIn } from './userRoutes.js';
import { upload } from '../config/multer.js';


const router = express.Router();

// ------------------------------------
// USER API ENDPOINTS
// ------------------------------------

// Get current user profile
router.get('/user/me', isLoggedIn, async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user._id)
            .populate('posts')
            .select('-password')
            .exec();
        res.json({ success: true, user });
    } catch (err) {
        next(err);
    }
});

// Get user by ID
router.get('/user/:userId', isLoggedIn, async (req, res, next) => {
    try {
        const user = await userModel.findById(req.params.userId)
            .populate('posts')
            .select('-password')
            .exec();
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, user });
    } catch (err) {
        next(err);
    }
});

// ------------------------------------
// POST API ENDPOINTS
// ------------------------------------

// Get feed (all posts)
router.get('/posts/feed', isLoggedIn, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const posts = await postModel.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username fullName dp')
            .populate('tags', 'name')
            .exec();

        const total = await postModel.countDocuments();

        res.json({
            success: true,
            posts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        next(err);
    }
});

// Get single post
router.get('/posts/:postId', isLoggedIn, async (req, res, next) => {
    try {
        const post = await postModel.findById(req.params.postId)
            .populate('user', 'username fullName dp')
            .populate('tags', 'name')
            .populate({
                path: 'comments',
                populate: { path: 'user', select: 'username dp' }
            })
            .exec();

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        res.json({ success: true, post });
    } catch (err) {
        next(err);
    }
});

// Create post (without image upload)
router.post('/posts/create', isLoggedIn, async (req, res, next) => {
    try {
        const { type, caption, content, tagsString, imageUrl } = req.body;
        const user = req.user;

        // Validate
        if (!type || (type === 'image' && !imageUrl)) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Create post
        const newPost = await postModel.create({
            user: user._id,
            type,
            caption,
            content,
            imageUrl
        });

        // Handle tags
        if (tagsString) {
            const tagsArray = tagsString.split(',').map(tag => tag.trim().toLowerCase()).filter(t => t.length > 0);
            const tagObjectIds = [];

            for (const tagName of tagsArray) {
                let tag = await tagModel.findOneAndUpdate(
                    { name: tagName },
                    { $setOnInsert: { name: tagName } },
                    { upsert: true, new: true }
                );

                if (!tag.posts.includes(newPost._id)) {
                    tag.posts.push(newPost._id);
                    await tag.save();
                }
                tagObjectIds.push(tag._id);
            }

            newPost.tags = tagObjectIds;
            await newPost.save();
        }

        // Add to user
        user.posts.push(newPost._id);
        await user.save();

        const populatedPost = await postModel.findById(newPost._id)
            .populate('user', 'username fullName dp')
            .populate('tags', 'name');

        res.status(201).json({ success: true, post: populatedPost });
    } catch (err) {
        next(err);
    }
});
// Create post (with image upload)
router.post('/upload-image', isLoggedIn, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ success: true, imageUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Like/Unlike post
router.post('/posts/:postId/like', isLoggedIn, async (req, res, next) => {
    try {
        const post = await postModel.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const userId = req.user._id;
        const index = post.likes.indexOf(userId);

        if (index === -1) {
            post.likes.push(userId);
            await post.save();
            res.json({ success: true, liked: true, likesCount: post.likes.length });
        } else {
            post.likes.splice(index, 1);
            await post.save();
            res.json({ success: true, liked: false, likesCount: post.likes.length });
        }
    } catch (err) {
        next(err);
    }
});

// Add comment
router.post('/posts/:postId/comment', isLoggedIn, async (req, res, next) => {
    try {
        const { text } = req.body;
        
        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, message: 'Comment text is required' });
        }

        const post = await postModel.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const commentModel = (await import('../models/comments.js')).default;
        const newComment = await commentModel.create({
            user: req.user._id,
            post: req.params.postId,
            text: text.trim()
        });

        post.comments.push(newComment._id);
        await post.save();

        const populatedComment = await commentModel.findById(newComment._id)
            .populate('user', 'username dp');

        res.status(201).json({ success: true, comment: populatedComment });
    } catch (err) {
        next(err);
    }
});

// ------------------------------------
// SEARCH API
// ------------------------------------

router.get('/search', isLoggedIn, async (req, res, next) => {
    try {
        const { q, type = 'all' } = req.query;
        
        if (!q) {
            return res.status(400).json({ success: false, message: 'Search query required' });
        }

        let results = {};

        if (type === 'posts' || type === 'all') {
            results.posts = await postModel.find({
                $or: [
                    { caption: { $regex: q, $options: 'i' } },
                    { content: { $regex: q, $options: 'i' } }
                ]
            })
            .populate('user', 'username fullName dp')
            .populate('tags', 'name')
            .limit(20)
            .exec();
        }

        if (type === 'users' || type === 'all') {
            results.users = await userModel.find({
                $or: [
                    { username: { $regex: q, $options: 'i' } },
                    { fullName: { $regex: q, $options: 'i' } }
                ]
            })
            .select('username fullName dp followers following')
            .limit(20)
            .exec();
        }

        if (type === 'tags' || type === 'all') {
            results.tags = await tagModel.find({
                name: { $regex: q, $options: 'i' }
            })
            .limit(10)
            .exec();
        }

        res.json({ success: true, results });
    } catch (err) {
        next(err);
    }
});

// Get posts by tag
router.get('/tags/:tagName', isLoggedIn, async (req, res, next) => {
    try {
        const tag = await tagModel.findOne({ name: req.params.tagName.toLowerCase() })
            .populate({
                path: 'posts',
                populate: { path: 'user', select: 'username fullName dp' }
            })
            .exec();

        if (!tag) {
            return res.status(404).json({ success: false, message: 'Tag not found' });
        }

        res.json({ success: true, tag });
    } catch (err) {
        next(err);
    }
});

// ------------------------------------
// FOLLOW/UNFOLLOW
// ------------------------------------

router.post('/user/:userId/follow', isLoggedIn, async (req, res, next) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
        }

        const [currentUser, targetUser] = await Promise.all([
            userModel.findById(currentUserId),
            userModel.findById(targetUserId)
        ]);

        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            currentUser.following.pull(targetUserId);
            targetUser.followers.pull(currentUserId);
        } else {
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);
        }

        await Promise.all([currentUser.save(), targetUser.save()]);

        res.json({
            success: true,
            isFollowing: !isFollowing,
            followersCount: targetUser.followers.length
        });
    } catch (err) {
        next(err);
    }
});

export default router;