export async function detectBatteryAndSensorDataFingerprinting() {
    const trackingResults = {
        battery: { found: false, value: null, isSuspicious: false, accessCount: 0 },
        sensor: { found: false, value: null, isSuspicious: false, accessCount: 0 },
        storage: { found: false, value: null, isSuspicious: false, accessCount: 0 }
    };

    // Enhanced suspicious patterns detection
    const suspiciousPatterns = {
        battery: [
            /getBattery\(\)/i,
            /battery\.level/i,
            /battery\.charging/i,
            /battery\.chargingTime/i,
            /battery\.dischargingTime/i,
            /levelchange|chargingchange|chargingtimechange/i,
            /setInterval.*battery/i
        ],
        sensor: [
            /devicemotion|deviceorientation/i,
            /Gyroscope|Accelerometer/i,
            /acceleration\.|rotationRate\./i,
            /alpha|beta|gamma/i,
            /addEventListener.*motion|orientation/i
        ],
        storage: [
            /localStorage\.setItem/i,
            /sessionStorage\.setItem/i,
            /document\.cookie/i
        ]
    };

    // Enhanced logging with immediate detection
    function logAndDetect(type, message, code = '') {
        trackingResults[type].found = true;
        trackingResults[type].value = message;
        trackingResults[type].accessCount++;

        // Check against suspicious patterns
        const patterns = suspiciousPatterns[type] || [];
        const isSuspicious = patterns.some(pattern => pattern.test(code));

        if (isSuspicious) {
            trackingResults[type].isSuspicious = true;
            console.warn(`🚨 Suspicious ${type} activity detected:`, message);
            console.warn('Suspicious code:', code);
        }

        // Check for rapid repeated access
        if (trackingResults[type].accessCount > 1) {
            console.warn(`⚠️ Rapid ${type} access detected: ${trackingResults[type].accessCount} times`);
        }
    }

    // Monitor script content
    function analyzeScript(scriptContent) {
        // Check for battery fingerprinting
        if (scriptContent.includes('getBattery')) {
            if (scriptContent.includes('setInterval')) {
                logAndDetect('battery', 'Aggressive battery polling detected', scriptContent);
            }
            if ((scriptContent.match(/addEventListener/g) || []).length > 1) {
                logAndDetect('battery', 'Multiple battery event listeners detected', scriptContent);
            }
        }

        // Check for sensor fingerprinting
        if (scriptContent.includes('devicemotion') || scriptContent.includes('deviceorientation')) {
            logAndDetect('sensor', 'Motion/Orientation tracking detected', scriptContent);
        }
        if (scriptContent.includes('Gyroscope') || scriptContent.includes('Accelerometer')) {
            logAndDetect('sensor', 'Direct sensor API access detected', scriptContent);
        }

        // Check for suspicious storage patterns
        if (scriptContent.includes('localStorage') || scriptContent.includes('sessionStorage') || scriptContent.includes('document.cookie')) {
            logAndDetect('storage', 'Device data storage detected', scriptContent);
        }
    }

    // Analyze existing scripts
    document.querySelectorAll('script').forEach(script => {
        analyzeScript(script.textContent || '');
    });

    // Monitor for dynamic script additions
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'SCRIPT') {
                    analyzeScript(node.textContent || '');
                }
            });
        });
    });

    observer.observe(document, { childList: true, subtree: true });

    // Enhanced Battery API monitoring
    if (navigator.getBattery) {
        const originalGetBattery = navigator.getBattery;
        navigator.getBattery = new Proxy(originalGetBattery, {
            apply: async function(target, thisArg, args) {
                logAndDetect('battery', 'Battery API accessed', 'navigator.getBattery()');
                const battery = await Reflect.apply(target, thisArg, args);
                
                // Monitor battery property access
                ['level', 'charging', 'chargingTime', 'dischargingTime'].forEach(prop => {
                    Object.defineProperty(battery, prop, {
                        get: function() {
                            logAndDetect('battery', `Battery ${prop} accessed`, `battery.${prop}`);
                            return this[`_${prop}`];
                        }
                    });
                });
                
                return battery;
            }
        });
    }

    // Enhanced motion/orientation monitoring
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
        if (['devicemotion', 'deviceorientation'].includes(type)) {
            logAndDetect('sensor', `${type} event listener added`, `addEventListener('${type}')`);
        }
        return originalAddEventListener.call(this, type, listener, options);
    };

    // Monitor storage APIs
    ['localStorage', 'sessionStorage'].forEach(storageType => {
        const storage = window[storageType];
        const originalSetItem = storage.setItem;
        storage.setItem = new Proxy(originalSetItem, {
            apply: function(target, thisArg, args) {
                logAndDetect('storage', `${storageType} write detected`, `${storageType}.setItem()`);
                return Reflect.apply(target, thisArg, args);
            }
        });
    });

    return trackingResults;
}
