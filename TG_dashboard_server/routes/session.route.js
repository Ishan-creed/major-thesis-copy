import express from "express";
import { addOrUpdateWebsiteInSession, getAllSessions, getSessionById , getWebsites,checkDeviceExists} from "../controller/session.controller.js";

const router = express.Router();

// Route to add or update a website in a session
router.post("/addToSession", addOrUpdateWebsiteInSession);

// Route to get all sessions for a specific device
router.get("/getSessions", getAllSessions);

// Route to get a specific session by ID and device ID
router.get("/sessions/:id", getSessionById);

router.get("/getWebsites",getWebsites)

router.post("/validator",checkDeviceExists);

export default router;
