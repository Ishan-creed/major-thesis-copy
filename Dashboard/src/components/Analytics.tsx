import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertOctagon, Shield } from 'lucide-react';

interface AnalyticsProps {
  severityPercentage: number;
  detectionsPercentage: number;
}

export function Analytics({ severityPercentage, detectionsPercentage }: AnalyticsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <AlertOctagon className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="font-semibold">Severity</h3>
          </div>
          <span className="text-2xl font-bold">{severityPercentage}%</span>
        </div>
        <Progress value={severityPercentage} className="h-2" />
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-semibold">Detections</h3>
          </div>
          <span className="text-2xl font-bold">{detectionsPercentage}%</span>
        </div>
        <Progress value={detectionsPercentage} className="h-2" />
      </Card>
    </div>
  );
}