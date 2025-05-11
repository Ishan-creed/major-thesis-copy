import { useEffect, useState } from 'react';
import axios from 'axios';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Clock, AlertTriangle } from 'lucide-react';

interface Session {
  id: string;
  currentDate: string; // Will display current time
  severity: 'low' | 'medium' | 'high';
}

const getSeverityColor = (severity: Session['severity']) => {
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

export function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch sessions from the backend
    const fetchSessions = async () => {
      try {
        const deviceId = 'your-device-id'; // Replace this with the actual deviceId you want to use
        const response = await axios.get('http://localhost:5000/api/getSessions');

        if (response.status === 200) {
          setSessions(response.data.sessions);
          console.log(response.data);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Simple loading state
  }

  return (
    <ScrollArea className="h-full rounded-md border">
      <div className="p-4 space-y-4">
        {sessions.map((session) => (
          <Card key={session.id} className="p-4 hover:bg-accent cursor-pointer">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{session.id}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  {/* Displaying the current time in place of the time range */}
                  {session.currentDate}
                </div>
              </div>
              <AlertTriangle className={`h-5 w-5 ${getSeverityColor(session.severity)}`} />
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}