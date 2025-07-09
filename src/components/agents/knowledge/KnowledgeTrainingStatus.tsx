
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TrainingStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  sourceName: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

interface KnowledgeTrainingStatusProps {
  agentId: string;
}

export const KnowledgeTrainingStatus = ({ agentId }: KnowledgeTrainingStatusProps) => {
  const [trainingJobs, setTrainingJobs] = useState<TrainingStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTrainingStatus = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockJobs: TrainingStatus[] = [
        {
          id: '1',
          status: 'completed',
          progress: 100,
          sourceName: 'Product Documentation.pdf',
          startedAt: '2024-01-15T10:30:00Z',
          completedAt: '2024-01-15T10:35:00Z'
        },
        {
          id: '2',
          status: 'processing',
          progress: 65,
          sourceName: 'FAQ Database.csv',
          startedAt: '2024-01-15T11:00:00Z'
        },
        {
          id: '3',
          status: 'pending',
          progress: 0,
          sourceName: 'User Manual.docx',
          startedAt: '2024-01-15T11:15:00Z'
        }
      ];
      
      setTrainingJobs(mockJobs);
    } catch (error) {
      console.error('Failed to fetch training status:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTrainingStatus();
  };

  useEffect(() => {
    fetchTrainingStatus();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchTrainingStatus, 5000);
    return () => clearInterval(interval);
  }, [agentId]);

  const getStatusIcon = (status: TrainingStatus['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <LoadingSpinner size="sm" className="!mb-0" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: TrainingStatus['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Training Status</CardTitle>
          <CardDescription>
            Knowledge source training progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" text="Loading training status..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Training Status</CardTitle>
          <CardDescription>
            Knowledge source training progress
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {trainingJobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No training jobs found
          </div>
        ) : (
          <div className="space-y-4">
            {trainingJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1">
                  {getStatusIcon(job.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {job.sourceName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Started: {new Date(job.startedAt).toLocaleString()}
                    </p>
                    {job.completedAt && (
                      <p className="text-xs text-muted-foreground">
                        Completed: {new Date(job.completedAt).toLocaleString()}
                      </p>
                    )}
                    {job.error && (
                      <p className="text-xs text-red-600 mt-1">
                        Error: {job.error}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {job.status === 'processing' && (
                    <div className="w-24">
                      <Progress value={job.progress} className="h-2" />
                      <p className="text-xs text-center mt-1">
                        {job.progress}%
                      </p>
                    </div>
                  )}
                  <Badge variant={getStatusBadgeVariant(job.status)}>
                    {job.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
