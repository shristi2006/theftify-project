// routes/userRoutes.js
import express from 'express';
import userModel from "../models/users.js";
import postModel from '../models/posts.js';
import passport from 'passport';

const router = express.Router();

// Middleware to check if user is logged in
export function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    
    // Check if it's an API request
    if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    // For web requests, redirect to login
    res.redirect("/"); 
}

// ------------------------------------
// WEB ROUTES (EJS Views)
// ------------------------------------

router.get('/', (req, res) => {
    // This is the login/homepage view
    res.render('index', { title: 'Theftify', error: req.flash('error') }); 
});

router.post("/register", async (req, res, next) => {
    const { username, email, fullName, password } = req.body;
    
    // Validate required fields
    if (!username || !email || !fullName || !password) {
        return res.render('index', { title: 'Theftify', error: 'All fields are required.' });
    }

    try {
        const userData = new userModel({ username, email, fullName });
        await userModel.register(userData, password);
        
        passport.authenticate("local")(req, res, function(){
            res.redirect("/profile");
        });
    } catch (err) {
        console.error("Registration Error:", err.message);
        res.render('index', { title: 'Theftify', error: err.message });
    }
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
    failureFlash: true 
}), (req, res) => {
    // This function executes only on successful login if no redirect is set
});

router.get("/logout", (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

router.get('/profile', isLoggedIn, async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user._id)
            .populate('posts') 
            .exec();
            
        res.render('profile', { user });
    } catch (err) {
        next(err);
    }
});

// ------------------------------------
// API ROUTES (JSON Responses for React Frontend)
// ------------------------------------

// Register API
router.post("/api/register", async (req, res, next) => {
    const { username, email, fullName, password } = req.body;
    
    if (!username || !email || !fullName || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required' 
        });
    }

    try {
        const userData = new userModel({ username, email, fullName });
        const registeredUser = await userModel.register(userData, password);
        
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            
            res.status(201).json({ 
                success: true,
                message: 'Registration successful',
                user: {
                    id: registeredUser._id,
                    username: registeredUser.username,
                    email: registeredUser.email,
                    fullName: registeredUser.fullName,
                    dp: registeredUser.dp
                }
            });
        });
    } catch (err) {
        console.error("Registration Error:", err.message);
        res.status(400).json({ 
            success: false, 
            message: err.message 
        });
    }
});

// Login API
router.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Server error during login' 
            });
        }
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: info.message || 'Invalid credentials' 
            });
        }
        
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Login failed' 
                });
            }
            
            res.json({ 
                success: true,
                message: 'Login successful',
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    dp: user.dp,
                    followers: user.followers.length,
                    following: user.following.length
                }
            });
        });
    })(req, res, next);
});

// Logout API
router.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Logout failed' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    });
});

// Get current user (check if logged in)
router.get("/api/user/me", isLoggedIn, async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user._id)
            .populate('posts')
            .select('-password')
            .exec();
        
        res.json({ 
            success: true, 
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                dp: user.dp,
                posts: user.posts,
                followers: user.followers,
                following: user.following,
                followersCount: user.followers.length,
                followingCount: user.following.length,
                postsCount: user.posts.length
            }
        });
    } catch (err) {
        next(err);
    }
});

// Get user profile by ID
router.get("/api/user/:userId", isLoggedIn, async (req, res, next) => {
    try {
        const user = await userModel.findById(req.params.userId)
            .populate({
                path: 'posts',
                populate: { path: 'tags', select: 'name' }
            })
            .select('-password')
            .exec();
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Check if current user is following this user
        const isFollowing = req.user.following.includes(user._id);
        
        res.json({ 
            success: true, 
            user: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                dp: user.dp,
                posts: user.posts,
                followersCount: user.followers.length,
                followingCount: user.following.length,
                postsCount: user.posts.length,
                isFollowing: isFollowing
            }
        });
    } catch (err) {
        next(err);
    }
});

// Update user profile
router.put("/api/user/profile", isLoggedIn, async (req, res, next) => {
    try {
        const { fullName, email } = req.body;
        const updates = {};

        if (fullName) updates.fullName = fullName;
        if (email) updates.email = email;

        const updatedUser = await userModel.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({ 
            success: true, 
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (err) {
        res.status(400).json({ 
            success: false, 
            message: err.message 
        });
    }
});

// Get user's posts
router.get("/api/user/:userId/posts", isLoggedIn, async (req, res, next) => {
    try {
        const posts = await postModel.find({ user: req.params.userId })
            .sort({ createdAt: -1 })
            .populate('user', 'username fullName dp')
            .populate('tags', 'name')
            .exec();

        res.json({ 
            success: true, 
            posts 
        });
    } catch (err) {
        next(err);
    }
});

// Get user's followers
router.get("/api/user/:userId/followers", isLoggedIn, async (req, res, next) => {
    try {
        const user = await userModel.findById(req.params.userId)
            .populate('followers', 'username fullName dp')
            .exec();

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({ 
            success: true, 
            followers: user.followers 
        });
    } catch (err) {
        next(err);
    }
});

// Get user's following
router.get("/api/user/:userId/following", isLoggedIn, async (req, res, next) => {
    try {
        const user = await userModel.findById(req.params.userId)
            .populate('following', 'username fullName dp')
            .exec();

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({ 
            success: true, 
            following: user.following 
        });
    } catch (err) {
        next(err);
    }
});

// Follow/Unfollow a user
router.post("/api/user/:userId/follow", isLoggedIn, async (req, res, next) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot follow yourself' 
            });
        }

        const [currentUser, targetUser] = await Promise.all([
            userModel.findById(currentUserId),
            userModel.findById(targetUserId)
        ]);

        if (!targetUser) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow
            currentUser.following.pull(targetUserId);
            targetUser.followers.pull(currentUserId);
            await Promise.all([currentUser.save(), targetUser.save()]);
            
            res.json({ 
                success: true, 
                message: 'Unfollowed successfully',
                isFollowing: false,
                followersCount: targetUser.followers.length 
            });
        } else {
            // Follow
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);
            await Promise.all([currentUser.save(), targetUser.save()]);
            
            res.json({ 
                success: true, 
                message: 'Followed successfully',
                isFollowing: true,
                followersCount: targetUser.followers.length 
            });
        }
    } catch (err) {
        next(err);
    }
});

export default router;