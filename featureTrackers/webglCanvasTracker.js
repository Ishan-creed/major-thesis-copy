export function detectWebGLCanvasFingerprinting() {
  const trackingResults = {
    canvas: { found: false, isSuspicious: false, details: [] },
    webgl: { found: false, isSuspicious: false, details: [] },
  };

  const benignScriptsWhitelist = [
    "adobe.target", // Adobe Target script
    "zepto.js",     // Common library
  ];

  function isScriptWhitelisted(scriptContent) {
    return benignScriptsWhitelist.some((keyword) =>
      scriptContent.includes(keyword)
    );
  }

  function logAndDetermineSuspicious(type, message) {
    trackingResults[type].found = true;

    if (!trackingResults[type].isSuspicious) {
      const suspiciousIndicators = [
        "fingerprint",
        "debug renderer",
        "sensitive data",
        "UNMASKED_RENDERER_WEBGL",
        "UNMASKED_VENDOR_WEBGL",
        "fillText",
        "measureText",
        "getParameter(",
        "toDataURL(",
        "getImageData(",
        "measureText(",
        "fillText(",
        "getContext('2d')",
        "getContext('webgl')",
        "fingerprintjs2",
        "fingerprintjs",
        "UNMASKED_RENDERER_WEBGL",
        "UNMASKED_VENDOR_WEBGL",
      ];
      if (suspiciousIndicators.some((indicator) => message.includes(indicator))) {
        trackingResults[type].isSuspicious = true;
      }
    }

    console.log(`${type} fingerprinting detected: ${message}`, {
      isSuspicious: trackingResults[type].isSuspicious,
      found: trackingResults[type].found,
    });

    window.postMessage(
      {
        type,
        suspicious: trackingResults[type].isSuspicious,
        found: trackingResults[type].found,
      },
      "*"
    );
  }

  // Monitor Canvas APIs
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function () {
    trackingResults.canvas.details.push("toDataURL method called");
    logAndDetermineSuspicious(
      "canvas",
      "toDataURL method called (possible fingerprinting)"
    );
    return originalToDataURL.apply(this, arguments);
  };

  const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
  CanvasRenderingContext2D.prototype.getImageData = function () {
    trackingResults.canvas.details.push("getImageData method called");
    logAndDetermineSuspicious(
      "canvas",
      "getImageData method called (possible fingerprinting)"
    );
    return originalGetImageData.apply(this, arguments);
  };

  const originalFillText = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function () {
    trackingResults.canvas.details.push(`fillText method called: ${arguments[0]}`);
    logAndDetermineSuspicious(
      "canvas",
      `fillText method called (possible fingerprinting): ${arguments[0]}`
    );
    return originalFillText.apply(this, arguments);
  };

  // Monitor WebGL APIs
  const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
  const originalGetExtension = WebGLRenderingContext.prototype.getExtension;

  WebGLRenderingContext.prototype.getParameter = function () {
    const isSensitive =
      arguments[0] === this.UNMASKED_RENDERER_WEBGL ||
      arguments[0] === this.UNMASKED_VENDOR_WEBGL;
    if (isSensitive) {
      trackingResults.webgl.details.push(
        `Sensitive WebGL parameter accessed: ${arguments[0]}`
      );
      logAndDetermineSuspicious(
        "webgl",
        `Sensitive WebGL parameter accessed: ${arguments[0]}`
      );
    }
    return originalGetParameter.apply(this, arguments);
  };

  WebGLRenderingContext.prototype.getExtension = function () {
    if (arguments[0] === "WEBGL_debug_renderer_info") {
      trackingResults.webgl.details.push(
        `WebGL debug extension accessed: ${arguments[0]}`
      );
      logAndDetermineSuspicious(
        "webgl",
        `WebGL debug extension accessed: ${arguments[0]}`
      );
    }
    return originalGetExtension.apply(this, arguments);
  };

  // Observe DOM mutations for Canvas elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === "CANVAS" || node.tagName === "CANVAS") {
            trackingResults.canvas.details.push("Canvas element added to DOM");
            logAndDetermineSuspicious(
              "canvas",
              "Canvas element added to DOM (possible fingerprinting)"
            );
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Scan inline scripts for suspicious patterns
  (function () {
    const scripts = document.getElementsByTagName("script");
    for (let script of scripts) {
      if (!script.textContent || isScriptWhitelisted(script.textContent)) {
        continue;
      }

      const suspiciousPatterns = [
        "getParameter(",
        "toDataURL(",
        "getImageData(",
        "measureText(",
        "fillText(",
        "getContext('2d')",
        "getContext('webgl')",
        "fingerprintjs2",
        "fingerprintjs",
        "UNMASKED_RENDERER_WEBGL",
        "UNMASKED_VENDOR_WEBGL",
      ];

      if (
        suspiciousPatterns.some((pattern) =>
          script.textContent.includes(pattern)
        )
      ) {
        trackingResults.webgl.details.push(
          "Suspicious WebGL-related script detected"
        );
        logAndDetermineSuspicious(
          "webgl",
          "Suspicious WebGL-related script detected"
        );
      }
    }
  })();

  return trackingResults;
}
