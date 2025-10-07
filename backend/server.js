// server.js
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import createError from 'http-errors';
import { connectDB } from "./config/db.js";
import apiRoutes from './routes/apiRoutes.js';

// Models & Passport Strategy
import userModel from "./models/users.js";
import { Strategy as LocalStrategy } from "passport-local";

// Route Imports
import userRoutes from './routes/userRoutes.js'; 
import postRoutes from './routes/postRoutes.js'; 

// --- ENVIRONMENT SETUP ---
dotenv.config();

// Fix for __dirname and __filename in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- APP INITIALIZATION & DB CONNECTION ---
const app = express();
const PORT = process.env.PORT || 5000;
connectDB(); 

// --- VIEW ENGINE & GENERAL MIDDLEWARE ---
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); 

// --- SESSION & PASSPORT CONFIGURATION ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_secure_default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport setup
passport.use(new LocalStrategy(userModel.authenticate()));
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());
app.use('/api', apiRoutes);

// --- ROUTE REGISTRATION ---
app.use('/', userRoutes); 
app.use('/post', postRoutes); 
// Combined interaction logic into postRoutes for simplicity: app.use('/interact', postRoutes); 


// --- ERROR HANDLERS ---
// Catch 404
app.use(function(req, res, next) {
  // If the request didn't match any route, return 404 JSON
  res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
});

// Basic error handler
app.use(function(err, req, res, next) {
  const status = err.status || 500;
  
  // Return error details as JSON
  res.status(status).json({
    success: false,
    message: err.message,
    // Include stack trace only in development
    error: req.app.get('env') === 'development' ? err : {}
  });
});
// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});