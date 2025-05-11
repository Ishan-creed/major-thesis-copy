import mongoose from "mongoose"; // Import the mongoose library for MongoDB interactions

// Function to connect to the MongoDB database
const connectDB = async (DB_URL, options = {}) => {
    try {
        // Default options for the connection
        const defaultOptions = {
            useNewUrlParser: true, // Use the new MongoDB connection string parser
            useUnifiedTopology: true, // Use the new server discovery and monitoring engine
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if no server is found
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            maxPoolSize: 10, // Maintain up to 10 socket connections
        };

        // Merge default options with any custom options provided
        const finalOptions = { ...defaultOptions, ...options };

        // Attempt to connect to the MongoDB database using the provided URL and options
        await mongoose.connect(DB_URL, finalOptions);
        console.log("Connected to MongoDB"); // Log a success message if the connection is successful
    } catch (error) {
        // Handle any errors that occur during the connection attempt
        console.error("Connection error", error.message); // Log the error message for debugging
        process.exit(1); // Exit the process with a failure code
    }
};

export default connectDB; // Export the connectDB function
