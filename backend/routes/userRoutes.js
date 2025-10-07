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
    // Set an error flash message if you use connect-flash
    res.redirect("/"); 
}

// ------------------------------------
// AUTHENTICATION
// ------------------------------------

router.get('/', (req, res) => {
    // This is the login/homepage view
    res.render('index', { title: 'Pinterest-Tumblr', error: req.flash('error') }); 
});

router.post("/register", async (req, res, next) => {
    const { username, email, fullName, password } = req.body;
    
    // Validate required fields
    if (!username || !email || !fullName || !password) {
        return res.render('index', { title: 'Pinterest-Tumblr', error: 'All fields are required.' });
    }

    try {
        const userData = new userModel( { username, email, fullName });

        await userModel.register(userData, password);
        
        passport.authenticate("local")(req, res, function(){
            res.redirect("/profile");
        });
    } catch (err) {
        // Handle registration error (e.g., username already exists)
        console.error("Registration Error:", err.message);
        res.render('index', { title: 'Pinterest-Tumblr', error: err.message });
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

// ------------------------------------
// PROFILE ROUTE
// ------------------------------------

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

export default router;