
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface TrainingWarningProps {
  show: boolean;
  sourcesLength: number;
}

const TrainingWarning = ({ show, sourcesLength }: TrainingWarningProps) => {
  if (!show || sourcesLength === 0) return null;

  return (
    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm flex items-center">
      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
      <span>Some knowledge sources need training for your agent to use them. Click "Train All" to process them.</span>
    </div>
  );
};

export default TrainingWarning;
