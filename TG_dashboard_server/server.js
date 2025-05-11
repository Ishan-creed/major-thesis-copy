// Import required modules
import express from 'express'; // Express framework
import bodyParser from 'body-parser'; // Middleware for parsing request bodies
import mongoose from 'mongoose'; // MongoDB object modeling
import dotenv from 'dotenv'; // Load environment variables
import cors from 'cors'; // Enable Cross-Origin Resource Sharing
import connectDB from './database/connectDB.js'; // Database connection function
import sessionRoutes from './routes/session.route.js';

// Load environment variables from .env file
dotenv.config();

// Create an Express application
export const app = express();
// Define the port, defaulting to 5000 if not specified
const port = process.env.PORT || 6000;

// Middleware setup
app.use(cors()); // Enable CORS
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json({ limit: '50mb' })); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Define application routes
app.use('/api',sessionRoutes);

// Start the server and connect to the database
app.listen(port, async () => {
    await connectDB(process.env.MONGODB_URI); // Connect to MongoDB
    console.log(`Server is listening on port ${port}`); // Log server start
});