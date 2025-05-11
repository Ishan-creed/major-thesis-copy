document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    let userDeviceId = null;
    
    // Function to set the theme
    function setTheme(theme) {
        document.body.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }

    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    // Toggle theme when the button is clicked
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.body.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        setTheme(newTheme);
    });

    // Connect to the background script
    const port = chrome.runtime.connect({ name: "popup-connection" });

    port.onMessage.addListener((message) => {
        console.log("Full message received:", message);
        
        // Update popup with trackers and website name
        if (message.type === "update_popup") {
            userDeviceId = message.userHash;
            console.log("Device ID received:", userDeviceId);
            
            if (userDeviceId) {
                console.log("Device ID stored:", userDeviceId);
            }
            
            updatePopup(message.trackers, message.websiteName);
        }
    });

    // Add click event listener to the button
    const showDetailsBtn = document.getElementById("showDetailsButton");

    showDetailsBtn.addEventListener("click", () => {
        console.log("Current deviceId value:", userDeviceId); 
        
        if (userDeviceId) {
            // Set a cookie for the device ID
            chrome.cookies.set({
                url: 'http://localhost:5173',  // Ensure the correct domain is provided
                name: 'trackGuardDeviceId',
                value: userDeviceId,
                expirationDate: (new Date().getTime() / 1000) + 60 * 60 * 24 * 365  // 1-year expiration
            }, function(cookie) {
                if (cookie) {
                    console.log("Device ID stored in cookie:", cookie);
                } else {
                    console.error("Error setting cookie.");
                }
            });

            // Create the URL for the dashboard
            const dashboardUrl = `http://localhost:5173/`;
            console.log("Opening dashboard with deviceId:", userDeviceId);
            
            // Open dashboard in new tab
            chrome.tabs.create({ url: dashboardUrl });
        } else {
            console.error("Device ID not available.");
            alert("Unable to access dashboard at the moment. Please try again later.");
        }
    });

    // Reset popup when switching tabs
    chrome.tabs.onActivated.addListener(() => {
        resetPopup();
    });

    // Log connection status
    port.onDisconnect.addListener(() => {
        console.log("Disconnected from background script.");
    });
});


function updatePopup(trackers, websiteName) {
    console.log(websiteName);
    const safeMessageElement = document.getElementById("safeMessage");
    const monitoringTable = document.querySelector(".table-container");
    const safetyStatus = document.querySelector(".status.success")
    // Handle Behavioral Tracking
    const behavioralRow = document.getElementById("behavioralTrackingRow");
    const behavioralDetails = document.getElementById("behavioralDetails");
    const websiteElement = document.getElementById("websiteName");



    if (websiteElement) {
        websiteElement.textContent = `${websiteName}`;
    }

    let hasTrackers = false;

    // Handle Behavioral Tracking
    if (trackers?.behavior) {
        const { mousemove, scroll, click, isSuspicious } = trackers.behavior;

        if (mousemove?.found || scroll?.found || click?.found) {
            hasTrackers = true;
            behavioralRow.style.display = "table-row";
            behavioralDetails.style.display = "block";

            if (isSuspicious) {
                behavioralDetails.style.backgroundColor = "red";
                behavioralDetails.style.color = "white";
            } else {
                behavioralDetails.style.backgroundColor = "#00A693";
                behavioralDetails.style.color = "white";
            }

            behavioralDetails.innerHTML = "";
            if (mousemove?.found) behavioralDetails.innerHTML += `<div><span class="key">Mouse Move:</span> <span class="value">Detected</span></div>`;
            if (scroll?.found) behavioralDetails.innerHTML += `<div><span class="key">Scroll:</span> <span class="value">Detected</span></div>`;
            if (click?.found) behavioralDetails.innerHTML += `<div><span class="key">Click:</span> <span class="value">Detected</span></div>`;
        } else {
            behavioralRow.style.display = "none";
        }
    } else {
        behavioralRow.style.display = "none";
    }

    // Handle System and Browser Details Tracking
    const systemRow = document.getElementById("systemBrowserRow");
    const systemDetails = document.getElementById("systemDetails");

    if (trackers?.systemBrowser) {
        const { userAgent, plugins, screen, networkRequests, cookies, isSuspicious } = trackers.systemBrowser;

        if (userAgent?.found || plugins?.found || screen?.found || networkRequests?.found || cookies?.found) {
            hasTrackers = true;
            systemRow.style.display = "table-row";
            systemDetails.style.display = "block";

            if (isSuspicious) {
                systemDetails.style.backgroundColor = "red";
                systemDetails.style.color = "white";
            } else {
                systemDetails.style.backgroundColor = "#00A693";
                systemDetails.style.color = "white";
            }

            systemDetails.innerHTML = "";
            if (userAgent?.found) systemDetails.innerHTML += `<div><span class="key">User-Agent:</span> <span class="value">${userAgent.value}</span></div>`;
            if (plugins?.found) systemDetails.innerHTML += `<div><span class="key">Plugins:</span> <span class="value">${plugins.value.join(", ")}</span></div>`;
            if (screen?.found) systemDetails.innerHTML += `<div><span class="key">Screen Info:</span> <span class="value">  ${screen.value.width}x${screen.value.height} (Color Depth: ${screen.value.colorDepth} bit)</span></div>`;
            if (networkRequests?.found) systemDetails.innerHTML += `<div><span class="key">Network Requests:</span> <span class="value">${networkRequests.details.length} Detected</span></div>`;
            if (cookies?.found) systemDetails.innerHTML += `<div><span class="key">Cookies:</span> <span class="value">Cookies Detected</span></div>`;
        } else {
            systemRow.style.display = "none";
        }
    } else {
        systemRow.style.display = "none";
    }


    // Handle Media Device Data Fingerprinting
    const mediaRow = document.getElementById("mediaDataFingerprintingRow");
    const mediaDetails = document.getElementById("mediaDetails");
    
    if (trackers?.mediaDeviceData?.mediaDevices) {
        const { isSuspicious, details } = trackers.mediaDeviceData.mediaDevices;
        console.log("Detaiiiilllss", details);
    
        if (trackers?.mediaDeviceData?.mediaDevices?.found || details?.found) {
            // Display the media data row and status
            hasTrackers = true;
            mediaRow.style.display = "table-row";
            mediaDetails.style.display = "block";
    
            // Check if the media device data is suspicious and adjust styles
            if (isSuspicious) {
                mediaDetails.style.backgroundColor = "red";
                mediaDetails.style.color = "white";
            } else {
                mediaDetails.style.backgroundColor = "#00A693";
                mediaDetails.style.color = "white";
            }
    
            // Populate the details field with the details from the details object
            if (details && Array.isArray(details)) {
                // Create a list to display each detail as a separate item
                mediaDetails.innerHTML = '';
                details.forEach(detail => {
                    mediaDetails.innerHTML += `<div>${detail}</div>`;
                });
              
            } else {
                // If no details are present, show a fallback message
                mediaDetails.innerHTML = "No details available.";
            }
    
        } else {
            mediaRow.style.display = "none";
        }
    } else {
        mediaRow.style.display = "none";
    }
    
    
    

    // Continue similar structure for the remaining rows


    // Handle Battery Status Fingerprinting
const batteryRow = document.getElementById("batteryStatusFingerprintingRow");
const batteryDetails = document.getElementById("batteryDetails");


// Assuming the detection results are available in trackers.batterySensorData.battery
if (trackers?.batterySensorData?.battery) {
    const { found, isSuspicious, value, accessCount } = trackers.batterySensorData.battery;

    console.log("Battery Tracking Details:", value); // Log the details for debugging
    console.log("Access Count:", accessCount); // Log the number of accesses

    // Show or hide the battery row and details based on the detection results
    if (found) {
        hasTrackers = true;
        batteryRow.style.display = "table-row";
        batteryDetails.style.display = "block";

        // Set the background color based on whether the activity is suspicious
        if (isSuspicious) {
            batteryDetails.style.backgroundColor = "red";
            batteryDetails.style.color = "white";
            safetyStatus.style.display = "inline-block"; // Show safety status when suspicious
        } else {
            batteryDetails.style.backgroundColor = "#00A693";
            batteryDetails.style.color = "white";
            safetyStatus.style.visibility = "hidden"; // Hide safety status when not suspicious
        }

        // Render battery details with the detected information
        const batteryInfo = `
            <div><strong>Status: </strong>Warning: ${value}</div>
        `;
        batteryDetails.innerHTML = batteryInfo;
    } else {
        batteryRow.style.display = "none"; // Hide the row if no fingerprinting was detected
    }
} else {
    batteryRow.style.display = "none"; // Hide if no tracking data exists
}

    
    // Handle Sensor Data Fingerprinting
    const sensorRow = document.getElementById("sensorDataFingerprintingRow");
    const sensorDetails = document.getElementById("sensorDetails");
    
    if (trackers?.batterySensorData?.sensor) {
        const { found, value, isSuspicious } = trackers.batterySensorData.sensor;
        console.log("SensorValue: ", value)
        if (found) {
            hasTrackers = true;
            sensorRow.style.display = "table-row";
            sensorDetails.style.display = "block";
    
            if (isSuspicious) {
                sensorDetails.style.backgroundColor = "red";
                sensorDetails.style.color = "white";
                safetyStatus.style.display = "inline-block";
            } else {
                sensorDetails.style.backgroundColor = "#00A693";
                sensorDetails.style.color = "white";
                safetyStatus.style.visibility = "hidden";
            }
    
            // Render sensor details
            const sensorInfo = `<div><strong>Detected Event:</strong> ${value}</div>`;
            sensorDetails.innerHTML = sensorInfo;
        } else {
            sensorRow.style.display = "none";
        }
    } else {
        sensorRow.style.display = "none";
    }
    
    // Handle Audio Fingerprinting
    const audioRow = document.getElementById("audioFingerprintingRow");
    const audioDetails = document.getElementById("audioDetails");

    if (trackers?.audioFont?.audio?.found) {
        hasTrackers = true;
        audioRow.style.display = "table-row";
        audioDetails.style.display = "block";

        if (trackers.audioFont.audio.isSuspicious) {
            safetyStatus.style.display = "inline-block"
            audioDetails.style.backgroundColor = "red";
            audioDetails.style.color = "white";
        } else {
            safetyStatus.style.visibility = "hidden"
            audioDetails.style.backgroundColor = "#00A693";
            audioDetails.style.color = "white";
        }

        audioDetails.innerHTML = trackers.audioFont.audio.details.map(detail => `<div>${detail}</div>`).join("");
    } else {
        audioRow.style.display = "none";
    }

    // Handle Font Fingerprinting
    const fontRow = document.getElementById("fontFingerprintingRow");
    const fontDetails = document.getElementById("fontDetails");

    if (trackers?.audioFont?.fonts?.found) {
        hasTrackers = true;
        fontRow.style.display = "table-row";
        fontDetails.style.display = "block";

        if (trackers.audioFont.fonts.isSuspicious) {
            safetyStatus.style.display = "inline-block"
            fontDetails.style.backgroundColor = "red";
            fontDetails.style.color = "white";
        } else {
            safetyStatus.style.visibility = "hidden"
            fontDetails.style.backgroundColor = "#00A693";
            fontDetails.style.color = "white";
        }

        fontDetails.innerHTML = trackers.audioFont.fonts.details.map(detail => `<div>${detail}</div>`).join("");
    } else {
        fontRow.style.display = "none";
    }

    // Handle WebGL/Canvas Fingerprinting
    const webglCanvasRow = document.getElementById("webglCanvasRow");
    const webglCanvasDetails = document.getElementById("webglCanvasDetails");

    if (trackers?.webglCanvas) {
        const { canvas, webgl, isSuspicious } = trackers.webglCanvas;

        if (canvas?.found || webgl?.found) {
            hasTrackers = true;
            webglCanvasRow.style.display = "table-row";
            webglCanvasDetails.style.display = "block";

            if (canvas.isSuspicious || webgl.isSuspicious) {
                safetyStatus.style.display = "inline-block"
                webglCanvasDetails.style.backgroundColor = "red";
                webglCanvasDetails.style.color = "white";
            } else {
                safetyStatus.style.visibility = "hidden"
                webglCanvasDetails.style.backgroundColor = "#00A693";
                webglCanvasDetails.style.color = "white";
            }

            webglCanvasDetails.innerHTML = "";
            if (canvas?.found) webglCanvasDetails.innerHTML += `<div><span class="key">Canvas:</span> <span class="value">Detected</span></div>`;
            if (webgl?.found) webglCanvasDetails.innerHTML += `<div><span class="key">WebGL:</span> <span class="value">Detected</span></div>`;
        } else {
            webglCanvasRow.style.display = "none";
        }
    } else {
        webglCanvasRow.style.display = "none";
    }

    // Update safe message visibility
    if (hasTrackers) {
        safeMessageElement.style.display = "none";
        monitoringTable.style.display = "block";
    } else {
        safeMessageElement.style.display = "block";
        monitoringTable.style.display = "none";
    }
}

function resetPopup() {
    const behavioralRow = document.getElementById("behavioralTrackingRow");
    const systemRow = document.getElementById("systemBrowserRow");
    const safeMessageElement = document.getElementById("safeMessage");
    const monitoringTable = document.querySelector(".table-container");

    // Reset rows
    behavioralRow.style.display = "none";
    systemRow.style.display = "none";

    // Hide table and show safe message
    safeMessageElement.style.display = "block";
    monitoringTable.style.display = "none";
}
