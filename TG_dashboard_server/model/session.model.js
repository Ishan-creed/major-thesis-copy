import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    currentDate: {
        type: String,
        required: true
    },
    websitesVisited: [
        {
            url: {
                type: String,
                required: true
            },
            trackers: {
                type: Object
            }
        }
    ]
});

const Session = mongoose.model("Session", sessionSchema);

export default Session;
