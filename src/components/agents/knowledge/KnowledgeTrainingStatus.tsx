
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  LoaderCircle, 
  AlertCircle, 
  Zap, 
  Import, 
  Trash2, 
  Link2Off, 
  RefreshCw,
  ChevronRight,
  ChevronDown,
  FileText,
  Globe,
  Folder
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { KnowledgeSource, UrlNode } from '@/types/agent';
import ImportSourcesDialog from './ImportSourcesDialog';
import { AlertBanner } from '@/components/ui/alert-banner';
import { 
  BASE_URL, 
  API_ENDPOINTS, 
  getAuthHeaders, 
  getAccessToken, 
  formatFileSizeToMB, 
  getSourceMetadataInfo, 
  getKnowledgeBaseEndpoint 
} from '@/utils/api';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface KnowledgeTrainingStatusProps {
  agentId?: string;
}

// Helper functions for toast messages
const getToastMessageForSourceChange = (source: KnowledgeSource) => {
  if (source.trainingStatus === 'error') {
    return {
      title: "Error Processing Knowledge",
      description: `Error processing ${source.name}. Please check the source and try again.`,
      variant: "destructive"
    };
  }
  
  if (source.linkBroken) {
    return {
      title: "Broken Link Detected",
      description: `Link for ${source.name} appears to be broken. Please update the source.`,
      variant: "destructive"
    };
  }
  
  return {
    title: "Knowledge Source Updated",
    description: `${source.name} has been successfully processed.`
  };
};

const getTrainingStatusToast = () => {
  return {
    title: "Training Started",
    description: "Your knowledge base is being trained. This may take a few minutes.",
  };
};

const getRetrainingRequiredToast = () => {
  return {
    title: "Retraining Recommended",
    description: "Some knowledge sources have changed and require retraining.",
    variant: "warning"
  };
};

const KnowledgeTrainingStatus: React.FC<KnowledgeTrainingStatusProps> = ({ agentId }) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [knowledgeSourceToDelete, setKnowledgeSourceToDelete] = useState<KnowledgeSource | null>(null);
  const [isRetrainingRequired, setIsRetrainingRequired] = useState(false);
  const [expandedStates, setExpandedStates] = useState<Record<number, boolean>>({});
  const [expandedUrlSections, setExpandedUrlSections] = useState<Record<string, boolean>>({});
  const toastRef = useRef(useToast());
  const { toast } = toastRef.current;

  const fetchKnowledgeSources = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      let apiUrl = getKnowledgeBaseEndpoint();
      if (agentId) {
        apiUrl += `&agent_id=${agentId}`;
      }

      const response = await fetch(apiUrl, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch knowledge sources: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error: any) {
      console.error('Error fetching knowledge sources:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch knowledge sources.',
        variant: 'destructive',
      });
      return [];
    }
  };

  const {
    data: knowledgeSources,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['knowledgeSources', agentId],
    queryFn: fetchKnowledgeSources,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (knowledgeSources && Array.isArray(knowledgeSources)) {
      const retrainingNeeded = knowledgeSources.some(source => source.trainingStatus === 'error' || source.linkBroken);
      setIsRetrainingRequired(retrainingNeeded);
    }
  }, [knowledgeSources]);

  const handleImportDialogOpen = () => {
    setIsImportDialogOpen(true);
  };

  const handleImportDialogClose = () => {
    setIsImportDialogOpen(false);
  };

  const handleKnowledgeSourceChange = (knowledgeSource: KnowledgeSource) => {
    const toastMessage = getToastMessageForSourceChange(knowledgeSource);
    if (toastMessage) {
      toast(toastMessage);
    }
    refetch();
  };

  const handleRetrain = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Using KNOWLEDGEBASE endpoint as TRAIN_KNOWLEDGEBASE is not defined
      const apiUrl = `${BASE_URL}${API_ENDPOINTS.KNOWLEDGEBASE}train/`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agent_id: agentId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to retrain knowledge base.');
      }

      toast(getTrainingStatusToast());
      refetch();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to retrain knowledge base.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteKnowledgeSource = (source: KnowledgeSource) => {
    setKnowledgeSourceToDelete(source);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteKnowledgeSource = async () => {
    if (!knowledgeSourceToDelete) return;
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Using the correct endpoint path
      const apiUrl = `${BASE_URL}knowledgesource/${knowledgeSourceToDelete.id}/`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete knowledge source.');
      }

      toast({
        title: 'Success',
        description: 'Knowledge source deleted successfully.',
      });
      refetch();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete knowledge source.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteAlertOpen(false);
      setKnowledgeSourceToDelete(null);
    }
  };

  const cancelDeleteKnowledgeSource = () => {
    setIsDeleteAlertOpen(false);
    setKnowledgeSourceToDelete(null);
  };

  const toggleExpand = (id: number) => {
    setExpandedStates(prevState => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const toggleUrlSectionExpand = (url: string) => {
    setExpandedUrlSections(prevState => ({
      ...prevState,
      [url]: !prevState[url],
    }));
  };

  const renderSourceIcon = (type: string) => {
    switch (type) {
      case 'website':
        return <Globe className="h-4 w-4 mr-2 text-blue-500" />;
      case 'document':
        return <FileText className="h-4 w-4 mr-2 text-orange-500" />;
      case 'folder':
        return <Folder className="h-4 w-4 mr-2 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4 mr-2" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Training Status</CardTitle>
          <CardDescription>Loading knowledge sources...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-4">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Training Status</CardTitle>
          <CardDescription>Error loading knowledge sources.</CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <AlertBanner 
            message="Failed to load knowledge sources. Please try again."
            variant="error"
            icon={<AlertCircle className="h-4 w-4 mr-2" />}
          />
        </CardContent>
      </Card>
    );
  }

  const trainingSources = Array.isArray(knowledgeSources) ? knowledgeSources.filter(source => source.trainingStatus === 'training') : [];
  const successfulSources = Array.isArray(knowledgeSources) ? knowledgeSources.filter(source => source.trainingStatus === 'success') : [];
  const errorSources = Array.isArray(knowledgeSources) ? knowledgeSources.filter(source => source.trainingStatus === 'error') : [];
  const idleSources = Array.isArray(knowledgeSources) ? knowledgeSources.filter(source => source.trainingStatus === 'idle') : [];
  const brokenLinkSources = Array.isArray(knowledgeSources) ? knowledgeSources.filter(source => source.linkBroken) : [];

  return (
    <div>
      {isRetrainingRequired && (
        <AlertBanner 
          message="Retraining is recommended to incorporate recent changes."
          variant="warning"
          icon={<RefreshCw className="h-4 w-4 mr-2" />}
          className="mb-4"
        >
          <Button variant="outline" size="sm" onClick={handleRetrain}>
            Retrain Now
          </Button>
        </AlertBanner>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Knowledge Training Status</CardTitle>
          <CardDescription>View the status of your knowledge sources and manage training.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {trainingSources.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Training</h4>
              {trainingSources.map(source => (
                <div key={source.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {renderSourceIcon(source.type)}
                    <span>{source.name}</span>
                  </div>
                  <Badge variant="secondary">
                    <LoaderCircle className="h-3 w-3 mr-1 animate-spin" />
                    Training
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {successfulSources.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Successful</h4>
              {successfulSources.map(source => (
                <div key={source.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {renderSourceIcon(source.type)}
                    <span>{source.name}</span>
                  </div>
                  <Badge>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Success
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {errorSources.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Errors</h4>
              {errorSources.map(source => (
                <div key={source.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {renderSourceIcon(source.type)}
                    <span>{source.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Error
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteKnowledgeSource(source)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {idleSources.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Idle</h4>
              {idleSources.map(source => (
                <div key={source.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {renderSourceIcon(source.type)}
                    <span>{source.name}</span>
                  </div>
                  <Badge variant="secondary">
                    <Zap className="h-3 w-3 mr-1" />
                    Idle
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {brokenLinkSources.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Broken Links</h4>
              {brokenLinkSources.map(source => (
                <div key={source.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {renderSourceIcon(source.type)}
                    <span>{source.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive">
                      <Link2Off className="h-3 w-3 mr-1" />
                      Broken Link
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteKnowledgeSource(source)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {Array.isArray(knowledgeSources) && knowledgeSources.map(source => (
            <Collapsible key={source.id} onOpenChange={() => toggleExpand(source.id)} open={expandedStates[source.id] || false}>
              <div className="border rounded-md p-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between py-2">
                    <div className="flex items-center">
                      {renderSourceIcon(source.type)}
                      <span>{source.name}</span>
                      {source.linkBroken && (
                        <Badge variant="destructive" className="ml-2">
                          <Link2Off className="h-3 w-3 mr-1" />
                          Broken Link
                        </Badge>
                      )}
                      {source.trainingStatus === 'error' && (
                        <Badge variant="destructive" className="ml-2">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      )}
                    </div>
                    {expandedStates[source.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                      <strong>Type:</strong> {source.type}
                    </p>
                    <p>
                      <strong>Size:</strong> {formatFileSizeToMB(parseInt(source.size, 10))} MB
                    </p>
                    {source.lastUpdated && (
                      <p>
                        <strong>Last Updated:</strong> {new Date(source.lastUpdated).toLocaleDateString()}
                      </p>
                    )}
                    {source.metadata && getSourceMetadataInfo(source.metadata)}
                    {source.type === 'website' && source.insideLinks && source.insideLinks.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-medium">Inside Links:</h5>
                        {source.insideLinks.map((link, index) => (
                          <div key={index}>
                            <Collapsible open={!!expandedUrlSections[link.url]} onOpenChange={() => toggleUrlSectionExpand(link.url)}>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between py-1 text-left">
                                  <div className="flex items-center">
                                    <span className="truncate">{link.title || link.url}</span>
                                    {link.status === 'error' && (
                                      <Badge variant="destructive" className="ml-2">
                                        Error
                                      </Badge>
                                    )}
                                  </div>
                                  {expandedUrlSections[link.url] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="pl-4">
                                <p className="text-xs">
                                  <strong>URL:</strong> {link.url}
                                </p>
                                <p className="text-xs">
                                  <strong>Status:</strong> {link.status}
                                </p>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDeleteKnowledgeSource(source)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Source
                    </Button>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}

          {Array.isArray(knowledgeSources) && knowledgeSources.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No knowledge sources added yet.</p>
              <Button variant="outline" onClick={handleImportDialogOpen}>
                <Import className="h-4 w-4 mr-2" />
                Import Sources
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ImportSourcesDialog 
        isOpen={isImportDialogOpen} 
        onClose={handleImportDialogClose} 
        onSourceChange={handleKnowledgeSourceChange} 
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Knowledge Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this knowledge source? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteKnowledgeSource}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteKnowledgeSource} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KnowledgeTrainingStatus;
