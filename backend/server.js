import express from "express";
import dotenv from "dotenv";
import path from "path";

console.log('Current directory:', process.cwd());
console.log('Loading .env from:', path.resolve(process.cwd(), '.env'));

// Import the database connection function
import { connectDB } from "./config/db.js";

// Load environment variables from the root folder
dotenv.config();

// Add this to see what was loaded
console.log('MONGO_URI:', process.env.MONGO_URI ? 'EXISTS' : 'UNDEFINED');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve root directory path
const __dirname = path.resolve();

app.use(express.json()); // allows us to accept JSON data in the req.body

// NOTE: Add your routes back here once you create product.route.js
// app.use("/api/products", productRoutes);

if (process.env.NODE_ENV === "production") {
    // Serve static files from the client build folder (assuming client is in root)
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

// Connect to the DB first, then start the server
connectDB();
app.listen(PORT, () => {
    console.log("Server started at http://localhost:" + PORT);
});