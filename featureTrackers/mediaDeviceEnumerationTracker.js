export function detectMediaDeviceFingerprinting() {
    const trackingResults = {
        mediaDevices: { found: false, isSuspicious: false, details: [] }
    };

    // Utility function to check for suspicious details
    function isSuspicious(details) {
        return details.some(detail => detail.toLowerCase().includes("fingerprinting"));
    }

    // Utility function to log and send messages if suspicious
    function logAndSendIfSuspicious(type, message) {
        const isSuspiciousFlag = isSuspicious(trackingResults[type].details);
        trackingResults[type].isSuspicious = isSuspiciousFlag;

        if (isSuspiciousFlag) {
            console.log(`${type} fingerprinting attempt detected: ${message}`);
            trackingResults[type].found = true;
        } else {
            console.log(`${type} activity detected, but not flagged as suspicious: ${message}`);
        }

        // Send suspicious flag and found status
        window.postMessage({
            type,
            isSuspicious: isSuspiciousFlag,
            found: trackingResults[type].found
        }, '*');
    }

    // --- Media Device Enumeration Detection ---
    (function () {
        const originalEnumerateDevices = navigator.mediaDevices.enumerateDevices;
        const originalGetUserMedia = navigator.mediaDevices.getUserMedia;

        // Intercept mediaDevices.enumerateDevices
        navigator.mediaDevices.enumerateDevices = function () {
            trackingResults.mediaDevices.found = true;
            trackingResults.mediaDevices.details.push("navigator.mediaDevices.enumerateDevices used for fingerprinting");
            logAndSendIfSuspicious("mediaDevices", "navigator.mediaDevices.enumerateDevices");
            return originalEnumerateDevices.apply(this, arguments);
        };

        // Intercept mediaDevices.getUserMedia
        navigator.mediaDevices.getUserMedia = function () {
            trackingResults.mediaDevices.found = true;
            trackingResults.mediaDevices.details.push("navigator.mediaDevices.getUserMedia used for fingerprinting");
            logAndSendIfSuspicious("mediaDevices", "navigator.mediaDevices.getUserMedia");
            return originalGetUserMedia.apply(this, arguments);
        };
    })();

    // --- Detect Script Tags for Media Device Enumeration ---
    (function () {
        const scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
            if (script.textContent.includes('enumerateDevices') || script.textContent.includes('getUserMedia')) {
                if (!trackingResults.mediaDevices.found) {
                    trackingResults.mediaDevices.found = true;
                    trackingResults.mediaDevices.details.push("Script containing media device enumeration code detected");
                    console.log("Script containing media device enumeration code detected", script.textContent);
                    logAndSendIfSuspicious("mediaDevices", "Script tag with media device enumeration");
                }
            }
        }
    })();

    return trackingResults;
}
