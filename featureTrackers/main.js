// main.js
(async function () {
    async function loadModules() {
        try {
            // Dynamically import all necessary modules
            const behaviorModule = await import('./behaviorTracker.js');
            const systemBrowserModule = await import('./systemBrowserTracker.js');
            const audioFontModule = await import('./audioFontTracker.js');
            const webglCanvasModule = await import('./webglCanvasTracker.js');
            const batterySensorDataModule = await import('./batterySensorDataTracker.js');
            const mediaDeviceModule = await import('./mediaDeviceEnumerationTracker.js');

            // Generate a unique identifier for the device
            function generateUniqueIdentifier() {
                const randomBytes = crypto.getRandomValues(new Uint8Array(16));
                return btoa(Array.from(randomBytes).join(''));
            }

            // Save the unique identifier in Chrome storage
            function saveUniqueIdentifier(identifier) {
                chrome.storage.local.set({ deviceID: identifier }, () => {
                    console.log('Unique Identifier Saved:', identifier);
                });
            }

            // Retrieve or create a unique identifier
            function getUniqueIdentifier(callback) {
                chrome.storage.local.get('deviceID', (result) => {
                    if (result.deviceID) {
                        console.log('Existing Unique Identifier:', result.deviceID);
                        callback(result.deviceID);
                    } else {
                        const newIdentifier = generateUniqueIdentifier();
                        saveUniqueIdentifier(newIdentifier);
                        callback(newIdentifier);
                    }
                });
            }

            // Generate a session ID using device ID and current date
            function generateSessionID(deviceID) {
                const dayStart = new Date().setHours(0, 0, 0, 0);
                return btoa(`${deviceID}-${dayStart}`);
            }

            // Save session data in Chrome storage
            function saveSessionData(sessionData) {
                chrome.storage.local.set({ sessionData }, () => {
                    console.log('Session Data Saved:', sessionData);
                });
            }

            // Retrieve session data from Chrome storage
            function getSessionData(callback) {
                chrome.storage.local.get('sessionData', (result) => {
                    callback(result.sessionData || {});
                });
            }

            // Get or create a session ID for the current day
            function getOrCreateSessionID(deviceID, callback) {
                getSessionData((sessionData) => {
                    const today = new Date().setHours(0, 0, 0, 0);

                    if (sessionData && sessionData.date === today) {
                        console.log('Reusing existing session ID:', sessionData.sessionID);
                        callback(sessionData.sessionID);
                    } else {
                        const newSessionID = generateSessionID(deviceID);
                        saveSessionData({ sessionID: newSessionID, date: today });
                        console.log('New session ID generated:', newSessionID);
                        callback(newSessionID);
                    }
                });
            }

            // Send tracking results with metadata
            function sendTrackingResults(results, deviceID, currentWebsiteURL, sessionID, elapsedTime, currentDate) {
                chrome.runtime.sendMessage({
                    type: 'tracking_check',
                    trackers: results,
                    deviceID,
                    currentWebsiteURL,
                    sessionID,
                    elapsedTime,
                    currentDate
                });
            }

            // Default detection methods for optional modules
            const detectBehaviorTracking = behaviorModule.detectBehaviorTracking || (() => ({}));
            const detectSystemBrowserTracking = systemBrowserModule.detectSystemBrowserTracking || (() => ({}));
            const detectAudioFontTracking = audioFontModule.detectAudioFontFingerprinting || (() => ({}));
            const detectBatterySensorData = batterySensorDataModule.detectBatteryAndSensorDataFingerprinting || (async () => ({}));
            const detectMediaDeviceData = mediaDeviceModule.detectMediaDeviceFingerprinting || (() => ({}));

            // Run individual tracking checks
            async function runTrackingChecks() {
                return {
                    behavior: await detectBehaviorTracking(),
                    webglCanvas: await webglCanvasModule.detectWebGLCanvasFingerprinting(),
                    systemBrowser: await detectSystemBrowserTracking(),
                    audioFont: await detectAudioFontTracking(),
                    batterySensorData: await detectBatterySensorData(),
                    mediaDeviceData: await detectMediaDeviceData(),
                };
            }

            // Monitor and handle session tracking
            function monitorSession() {
                getUniqueIdentifier((deviceID) => {
                    getOrCreateSessionID(deviceID, async (sessionID) => {
                        const results = await runTrackingChecks();
                        const currentWebsiteURL = window.location.href;
                        const currentDate = new Date().toLocaleDateString();

                        sendTrackingResults(results, deviceID, currentWebsiteURL, sessionID, 0, currentDate);
                        console.log('Tracking checks completed and results sent.');
                    });
                });
            }

            // Start session monitoring
            monitorSession();
        } catch (error) {
            console.error('Error loading modules or running tracking detections:', error);
        }
    }

    // Initialize the script
    loadModules();
})();
