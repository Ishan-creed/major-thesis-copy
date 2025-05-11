import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SessionList } from "@/components/SessionList";
import { WebsiteList } from "@/components/WebsiteList";
import { Analytics } from "@/components/Analytics";
import { DetectionList } from "@/components/DetectionList";
import { useEffect, useState } from "react";

function App() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showValidationPopup, setShowValidationPopup] = useState(true);
  const [showResultPopup, setShowResultPopup] = useState(false);

  useEffect(() => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("trackGuardDeviceId="))
      ?.split("=")[1];

    if (cookieValue) {
      setDeviceId(cookieValue);
      console.log("Device ID found in cookies:", cookieValue);

      // Simulating validation with a delay
      setTimeout(() => {
        console.log(
          "Skipping validation for now. Assuming user is authenticated."
        );
        setAuthenticated(true);
        setShowValidationPopup(false);

        // Show success popup briefly
        setShowResultPopup(true);
        setTimeout(() => {
          setShowResultPopup(false);
        }, 1500); // Hide success popup after 1.5 seconds
        setLoading(false); // Stop loading after the delay
      }, 2000); // Adding a 2-second delay
    } else {
      setTimeout(() => {
        console.log("Device ID not found in records.");
        setAuthenticated(false);
        setErrorMessage("No device ID found in records.");
        setShowValidationPopup(false);
        setShowResultPopup(true);
        setLoading(false); // Stop loading after the delay
      }, 2000); // Adding a 2-second delay
    }
  }, []);

  // Determine content visibility class based on authentication status
  const contentVisibilityClass =
    authenticated === false
      ? "opacity-0 pointer-events-none" // Hide content completely when authentication fails
      : "";

  return (
    <ThemeProvider defaultTheme="light" storageKey="dashboard-theme">
      <div className="h-screen w-screen overflow-hidden bg-background flex flex-col relative">
        {/* Initial validation popup */}
        {showValidationPopup && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
              <div className="mb-4">Validating device ID...</div>
              <div className="animate-spin">
                <svg
                  className="w-8 h-8 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" stroke="none"></circle>
                  <path d="M12 2a10 10 0 0 1 0 20"></path>
                </svg>
              </div>
              {deviceId && (
                <div className="mt-4 text-sm text-gray-600">
                  <div>Device ID: {deviceId}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result popup - only shown for errors */}
        {showResultPopup && !loading && authenticated === false && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex justify-center items-center z-10">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
              <div className="mb-4 text-red-500">Authentication Failed</div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="red"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <div className="mt-4 text-sm text-red-500">
                {errorMessage || "An error occurred during validation."}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header
          className={`h-14 border-b flex items-center justify-between px-4 bg-card text-card-foreground shadow-md ${contentVisibilityClass}`}
        >
          <h1 className="header-title">Track Guard</h1>
          <ThemeToggle />
        </header>

        {/* Main Content */}
        <main
          className={`flex-1 flex transition-all duration-300 ${contentVisibilityClass}`}
        >
          {/* Left Section - 40% */}
          <div className="w-[40%] p-6 border-r flex flex-col">
            {/* Sessions - 35% */}
            {/* Sessions - Adjusted for dynamic height */}
            <div className="mb-6 flex flex-col">
              <h2 className="text-2xl font-bold mb-4">Sessions</h2>
              <div className="flex-1 overflow-y-auto">
                <SessionList />
              </div>
            </div>

            {/* Websites - 65% */}
            <div className="h-[65%]">
              <h2 className="text-2xl font-bold mb-4">Websites</h2>
              <div className="h-[calc(100%-2rem)]">
                <WebsiteList />
              </div>
            </div>
          </div>

          {/* Right Section - 60% */}
          <div className="w-[60%] p-6 flex flex-col">
            {/* Analytics */}
            <Analytics severityPercentage={75} detectionsPercentage={60} />

            {/* Detections */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">Detections</h2>
              <div className="h-[calc(100%-3rem)]">
                <DetectionList />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
