import Session from "../model/session.model.js";

/**
 * Add or update a website in a session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const addOrUpdateWebsiteInSession = async (req, res) => {
    try {
        const { deviceId, sessionId, website, currentDate } = req.body;

        console.log("\n=== Starting Session Update Process ===");
        console.log("Request data:", { deviceId, sessionId, website });

        // Find the existing session
        let session = await Session.findOne({
            deviceId: deviceId,
            sessionId: sessionId
        });

        console.log("Existing session found:", session ? "Yes" : "No");

        if (!session) {
            console.log("Creating new session...");
            // Create new session if none exists
            session = new Session({
                deviceId,
                sessionId,
                currentDate,
                websitesVisited: [website], // Initialize as array
            });
        } else {
            console.log("Updating existing session...");
            // Ensure websitesVisited is an array
            session.websitesVisited = session.websitesVisited || [];

            // Check if the website already exists
            const websiteIndex = session.websitesVisited.findIndex(
                (w) => w.url === website.url
            );

            if (websiteIndex !== -1) {
                // Update the trackers for the existing website
                session.websitesVisited[websiteIndex].trackers = website.trackers;
                console.log("Updated trackers for existing website");
            } else {
                // Add new website to the array
                session.websitesVisited.push(website);
                console.log("Added new website to session");
            }
        }

        // Save the session
        const savedSession = await session.save();
        console.log("Session saved successfully",savedSession);

        // Ensure `websitesVisited` is an array
        const websitesCount = Array.isArray(savedSession.websitesVisited)
            ? savedSession.websitesVisited.length
            : 0;

        console.log("Number of websites in session:", websitesCount);

        res.status(200).json({
            message: "Session updated successfully",
            session: savedSession
        });

    } catch (error) {
        console.error("\n=== Error in Session Update ===");
        console.error("Error details:", error);

        res.status(500).json({
            message: "Failed to update session",
            error: error.message
        });
    }
};


/**
 * Get all sessions for a specific device
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllSessions = async (req, res) => {
    try {
        // const { deviceId } = req.body; // Get deviceId from request body

        // if (!deviceId) {
        //     return res.status(400).json({
        //         message: "Device ID is required",
        //     });
        // }

        // Retrieve all sessions for the given deviceId
        const sessions = await Session.find();

        if (sessions.length === 0) {
            return res.status(404).json({
                message: "No sessions found for this device",
            });
        }

        res.status(200).json({
            message: "Sessions retrieved successfully",
            sessions,
        });
    } catch (error) {
        console.error("Error retrieving sessions:", error);
        res.status(500).json({
            message: "Failed to retrieve sessions",
            error: error.message,
        });
    }
};

/**
 * Get session by ID and deviceId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getSessionById = async (req, res) => {
    try {
        const { sessionId, deviceId } = req.body; // Get sessionId and deviceId from request body

        if (!deviceId || !sessionId) {
            return res.status(400).json({
                message: "Device ID and Session ID are required",
            });
        }

        // Find session by sessionId and deviceId
        const session = await Session.findOne({ sessionId, deviceId });

        if (!session) {
            return res.status(404).json({
                message: "Session not found for this device",
            });
        }

        res.status(200).json({
            message: "Session retrieved successfully",
            session,
        });
    } catch (error) {
        console.error("Error retrieving session:", error);
        res.status(500).json({
            message: "Failed to retrieve session",
            error: error.message,
        });
    }
};
export const getWebsites = async (req, res) => {
    try {
        // Fetch sessions from the database
        const sessions = await Session.find();

        console.log(sessions); // Log the sessions to inspect their content

        if (!sessions.length) {
            return res.status(404).json({ message: 'No sessions found' });
        }

        // Aggregate website visits from all sessions
        const websiteVisits = {};

        // Iterate over each session and its websitesVisited array
        sessions.forEach(session => {
            console.log(session.websitesVisited); // Log each session's websitesVisited array

            // Check if the websitesVisited array exists and is an array
            if (Array.isArray(session.websitesVisited)) {
                // Iterate over each website object inside the websitesVisited array
                session.websitesVisited.forEach(website => {
                    if (website.url) {
                        // Increment visit count for each unique URL
                        if (websiteVisits[website.url]) {
                            websiteVisits[website.url]++;
                        } else {
                            websiteVisits[website.url] = 1;
                        }
                    }
                });
            }
        });

        // Convert the aggregated data into an array of websites with visit counts
        const websites = Object.keys(websiteVisits).map(url => ({
            url,
            visits: websiteVisits[url],
        }));

        console.log(websites); // Log the final aggregated websites array

        // Send the response with the aggregated website data
        res.status(200).json({ websites });
    } catch (error) {
        console.error('Error fetching websites:', error);
        res.status(500).json({ message: 'Failed to fetch websites', error: error.message });
    }
};

  
  

/**
 * Check if a device exists in the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const checkDeviceExists = async (req, res) => {
    try {
        const { deviceId } = req.body; // Get deviceId from request body

        if (!deviceId) {
            return res.status(400).json({
                message: "Device ID is required",
            });
        }

        // Search for the deviceId in the sessions collection
        const session = await Session.findOne({ deviceId });

        if (session) {
            // Device exists
            return res.status(200).json({
                message: "Device exists",
                exists: true,
            });
        } else {
            // Device doesn't exist
            return res.status(404).json({
                message: "Device not found",
                exists: false,
            });
        }
    } catch (error) {
        console.error("Error checking device existence:", error);
        res.status(500).json({
            message: "Failed to check device existence",
            error: error.message,
        });
    }
};
