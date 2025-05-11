let cachedTrackers = {}; // To store the latest tracking data
let cachedName = ""; // Store the website name
let userHash = ""; // Store the unique user hash
let deviceID = ""; // Store device ID
let sessionID = ""; // Store session ID
let currentDate = ""; // Store Current Date
let currentWebsiteURL = ""; // Store Current Website URL
let websiteDataArray = []; // Array to store website data objects

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === "tracking_check") {
        if (message.deviceID && message.sessionID) {
            console.log("Tracking Detection Results:", message);
            userHash = message.deviceID;
            const trackingData = {
                deviceId: message.deviceID,
                sessionId: message.sessionID,
                currentDate: message.currentDate,
                website: {
                    url: message.currentWebsiteURL,
                    trackers: message.trackers,
                },
            };

            cachedTrackers = message.trackers;

            // Update the badge with the latest tracker count immediately
            if (sender.tab?.id) {
                updateBadge(cachedTrackers, sender.tab.id);
            }

            // Attempt to send data to the server
            try {
                const response = await fetch("http://localhost:5000/api/addToSession", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(trackingData),
                });

                const data = await response.json();
                console.log("Session data posted successfully:", data);
            } catch (error) {
                console.error("Error posting session data:", error);
            }

            sendResponse({ status: "Tracking results processed" });
        } else {
            console.log("Device ID and/or Session ID missing in the message. Skipping processing.");
            sendResponse({ status: "Device ID and/or Session ID missing" });
        }
    }
});

// Function to update the badge with tracker count
function updateBadge(trackers, tabId) {
    const totalTrackers = countTrackers(trackers);

    if (totalTrackers > 0) {
        chrome.action.setBadgeText({
            text: totalTrackers.toString(),
            tabId: tabId,
        });

        chrome.action.setBadgeBackgroundColor({
            color: totalTrackers > 5 ? "#FFA500" : "#008000",
            tabId: tabId,
        });
    } else {
        chrome.action.setBadgeText({
            text: "",
            tabId: tabId,
        });
    }
}


// Function to count the total trackers
function countTrackers(trackers) {
    let total = 0;

    if (trackers?.behavior) {
        total +=
            (trackers.behavior.mousemove?.found ? 1 : 0) +
            (trackers.behavior.scroll?.found ? 1 : 0) +
            (trackers.behavior.click?.found ? 1 : 0);
    }

    if (trackers?.systemBrowser) {
        total +=
            (trackers.systemBrowser.userAgent?.found ? 1 : 0) +
            (trackers.systemBrowser.plugins?.found ? 1 : 0) +
            (trackers.systemBrowser.screen?.found ? 1 : 0) +
            (trackers.systemBrowser.networkRequests?.found ? 1 : 0) +
            (trackers.systemBrowser.cookies?.found ? 1 : 0);
    }

    if (trackers?.audioFont) {
        total +=
            (trackers.audioFont.audio?.found ? 1 : 0) +
            (trackers.audioFont.fonts?.found ? 1 : 0);
    }

    if (trackers?.webglCanvas) {
        total +=
            (trackers.webglCanvas.canvas?.found ? 1 : 0) +
            (trackers.webglCanvas.webgl?.found ? 1 : 0);
    }

    if (trackers?.batterySensorData) {
        total +=
            (trackers.batterySensorData.battery?.found ? 1 : 0) +
            (trackers.batterySensorData.sensor?.found ? 1 : 0);
    }

    if (trackers?.mediaDeviceData) {
        total += trackers.mediaDeviceData.mediaDevices?.found ? 1 : 0;
    }

    console.log("Total Trackers:", total);
    return total;
}

// Communication with popup
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "popup-connection") {
        console.log("Popup connected to background script.");

        port.postMessage({
            type: "update_popup",
            trackers: cachedTrackers,
            websiteName: cachedName,
            userHash: userHash,
        });
        console.log("Popup Details Sent, ",deviceID)

        port.onDisconnect.addListener(() => {
            console.log("Popup disconnected.");
        });
    }
});

// Update cached website name when the active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);

    if (tab?.url) {
        const websiteName = new URL(tab.url).hostname;
        console.log("WebsiteName:", websiteName);

        cachedName = websiteName;

        chrome.runtime.sendMessage({
            type: "update_popup",
            websiteName: cachedName,
        });
    }
});
