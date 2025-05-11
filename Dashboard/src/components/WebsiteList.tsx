import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Globe, Hash } from 'lucide-react';

interface Website {
  url: string;
  visits: number;
}

export function WebsiteList() {
  const [websites, setWebsites] = useState<Website[]>([]); // State to store websites data
  const [loading, setLoading] = useState<boolean>(true); // State for loading status
  const [error, setError] = useState<string | null>(null); // State for error handling

  useEffect(() => {
    // Fetch the websites data from the backend
    const fetchWebsites = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/getWebsites');
        if (!response.ok) {
          throw new Error('Failed to fetch websites');
        }
        const data = await response.json();
        setWebsites(data.websites); // Set the fetched websites to state
      } catch (error: any) {
        setError(error.message); // Set error message if request fails
      } finally {
        setLoading(false); // Set loading to false after the fetch operation completes
      }
    };

    fetchWebsites(); // Call the fetch function
  }, []); // Empty dependency array to run the effect only once on component mount

  if (loading) {
    return <div>Loading...</div>; // Display loading state
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error message if any error occurred
  }

  // Function to trim URL to a specific length
  const trimUrl = (url: string, maxLength: number = 50) => {
    if (url.length > maxLength) {
      return `${url.slice(0, maxLength)}...`; // Trim the URL and add ellipsis
    }
    return url; // Return the URL as is if it's shorter than maxLength
  };

  return (
    <ScrollArea className="h-full rounded-md border">
      <div className="p-4 space-y-4">
        {websites.map((website) => (
          <Card key={website.url} className="p-4 hover:bg-accent cursor-pointer">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Globe className="mr-2 h-4 w-4" />
                <span className="truncate w-full">{trimUrl(website.url)}</span> {/* Trim URL */}
              </div>
              <div className="flex items-center text-muted-foreground">
                <Hash className="mr-1 h-4 w-4" />
                <span>{website.visits}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
