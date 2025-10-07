import express from 'express';
import tagModel from '../models/tags.js';
import { isLoggedIn } from './userRoutes.js';

const router = express.Router();

router.get('/:tagName', isLoggedIn, async (req, res, next) => {
    try {
        const tag = await tagModel.findOne({ name: req.params.tagName.toLowerCase() })
            .populate({
                path: 'posts',
                populate: { path: 'user' }
            })
            .exec();

        if (!tag) {
            return res.status(404).json({ message: `No posts found for tag: #${req.params.tagName}` });
        }

        res.json({ tagName: tag.name, posts: tag.posts });
    } catch (err) {
        next(err);
    }
});

export default router;