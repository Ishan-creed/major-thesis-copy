import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Shield, Clock, AlertTriangle } from 'lucide-react';

interface Detection {
  id: string;
  timestamp: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  details: string;
  reasons: string;
  suggestedActions: string;
}

const detections: Detection[] = [
  {
    id: 'DET001',
    timestamp: '08:45 PM',
    type: 'User Agent',
    severity: 'high',
    details: "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Plugins: PDF Viewer, PDF Viewer Screen Info: 1536x864 (Color Depth: 24 bit) Cookies: Cookies Detected",
    reasons: "The User-Agent string was detected and used to track the user across sessions. Browser plugins and screen resolution were also used as tracking mechanisms.",
    suggestedActions: "Consider clearing browser cookies, using privacy-focused browser settings, and disabling unnecessary plugins to prevent tracking.",
  },
  {
    id: 'DET002',
    timestamp: '08:46 PM',
    type: 'Battery & Sensor Data',
    severity: 'medium',
    details: "Script Containing navigator.battery caught",
    reasons: "The `navigator.battery` API was accessed, which provides information about the device's battery status. This can be used to uniquely identify a device based on its battery characteristics.",
    suggestedActions: "Disable JavaScript or use an anti-fingerprinting browser extension that blocks access to `navigator.battery` to prevent tracking.",
  },
  // Add more detections as needed
];

const getSeverityColor = (severity: Detection['severity']) => {
  switch (severity) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

export function DetectionList() {
  return (
    <ScrollArea className="h-full rounded-md border">
      <div className="p-4 space-y-4">
        {detections.map((detection) => (
          <Card key={detection.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="font-semibold">{detection.type}</h3>
                </div>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  {detection.timestamp}
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm mr-2">{detection.id}</span>
                <AlertTriangle className={`h-5 w-5 ${getSeverityColor(detection.severity)}`} />
              </div>
            </div>

            {/* Add the details section with reasons and suggested actions */}
            <div className="mt-2 text-sm text-gray-700">
              <strong>Details:</strong>
              <p>{detection.details}</p>
              <div className="mt-2">
                <strong>Reasons for Tracking:</strong>
                <p>{detection.reasons}</p>
              </div>
              <div className="mt-2">
                <strong>Suggested Actions:</strong>
                <p>{detection.suggestedActions}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
