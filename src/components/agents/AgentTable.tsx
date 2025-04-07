
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Brain, 
  Play, 
  Rocket, 
  AlertTriangle, 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2,
  Check,
  Globe,
  File,
  FolderOpen
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import KnowledgeSourceBadge from './KnowledgeSourceBadge';
import DeploymentDialog from './DeploymentDialog';
import { KnowledgeSource, UrlNode } from '@/components/agents/knowledge/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AgentTableProps {
  agents: Array<{
    id: string;
    name: string;
    description: string;
    conversations: number;
    lastModified: string;
    averageRating: number;
    knowledgeSources: KnowledgeSource[];
    model: string;
    isDeployed: boolean;
  }>;
  getModelBadgeColor: (model: string) => string;
}

const AgentTable = ({ agents, getModelBadgeColor }: AgentTableProps) => {
  const [deploymentDialogOpen, setDeploymentDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<{id: string, name: string} | null>(null);

  const openDeploymentDialog = (agent: {id: string, name: string}) => {
    setSelectedAgent(agent);
    setDeploymentDialogOpen(true);
  };

  const getSelectedDocumentCount = (source: KnowledgeSource): number => {
    let count = 0;
    
    // Count documents that are manually selected
    if (source.documents) {
      count += source.documents.filter(doc => doc.selected).length;
    }
    
    // Count selected knowledge sources from imported files
    if (source.knowledge_sources) {
      count += source.knowledge_sources.filter(src => src.selected || src.is_selected).length || 0;
    }
    
    return count;
  };

  // Helper function to count selected sub-URLs from the API response
  const getSelectedSubUrlsCount = (source: KnowledgeSource): number => {
    let count = 0;
    
    // Count selectedSubUrls if exists
    if (source.selectedSubUrls) {
      count += source.selectedSubUrls.size;
    }
    
    // Count insideLinks that are selected
    if (source.insideLinks) {
      count += source.insideLinks.filter(link => link.selected).length;
    }

    // Count from metadata.sub_urls.children if they exist and are selected
    if (source.metadata?.sub_urls?.children) {
      console.log(`Counting selected sub URLs for ${source.name} from metadata.sub_urls.children`);
      
      const countSelectedChildren = (nodes: UrlNode[] | undefined) => {
        if (!nodes) return 0;
        
        let selectedCount = 0;
        for (const node of nodes) {
          console.log(`Node ${node.url}, is_selected: ${node.is_selected}`);
          if (node.is_selected) {
            selectedCount++;
          }
          if (node.children && node.children.length > 0) {
            selectedCount += countSelectedChildren(node.children);
          }
        }
        return selectedCount;
      };
      
      const selectedChildrenCount = countSelectedChildren(source.metadata.sub_urls.children);
      console.log(`Selected children count: ${selectedChildrenCount}`);
      count += selectedChildrenCount;
    }
    
    return count;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Knowledge Sources</TableHead>
            <TableHead>Conversations</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-primary" />
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-muted-foreground">{agent.description}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getModelBadgeColor(agent.model)}>
                  <Brain className="h-3 w-3 mr-1" />
                  {agent.model}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap">
                  {agent.knowledgeSources.map(source => {
                    console.log(`Rendering KnowledgeSourceBadge for ${source.name}:`, { 
                      type: source.type,
                      selectedUrls: getSelectedSubUrlsCount(source),
                      selectedDocs: getSelectedDocumentCount(source)
                    });
                    
                    return (
                    <div key={source.id} className="mr-1 mb-1">
                      <KnowledgeSourceBadge source={source} />
                      
                      {(source.type === 'website' || source.type === 'url') && 
                       (getSelectedSubUrlsCount(source) > 0) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-xs text-green-700 ml-6 flex items-center">
                                <Globe className="h-3 w-3 mr-1" />
                                {getSelectedSubUrlsCount(source)} URLs
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Selected URLs for {source.name}</p>
                              <ul className="text-xs list-disc pl-4 mt-1">
                                {source.selectedSubUrls && Array.from(source.selectedSubUrls).slice(0, 5).map((url, i) => (
                                  <li key={i}>{url}</li>
                                ))}
                                {source.insideLinks?.filter(link => link.selected).slice(0, 5).map((link, i) => (
                                  <li key={i}>{link.title || link.url}</li>
                                ))}
                                {source.metadata?.sub_urls?.children?.filter(node => node.is_selected).slice(0, 5).map((node, i) => (
                                  <li key={i}>{node.title || node.url}</li>
                                ))}
                                {getSelectedSubUrlsCount(source) > 5 && (
                                  <li>... and more</li>
                                )}
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {(source.type === 'docs' || source.type === 'csv') && 
                       (getSelectedDocumentCount(source) > 0) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-xs text-blue-700 ml-6 flex items-center">
                                <File className="h-3 w-3 mr-1" />
                                {getSelectedDocumentCount(source)} selected
                                {source.knowledge_sources && source.knowledge_sources.length > 0 && (
                                  <span className="ml-1 flex items-center">
                                    <FolderOpen className="h-3 w-3 mx-1" />
                                    {source.knowledge_sources.filter(src => src.selected || src.is_selected).length} imported
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Files for {source.name}</p>
                              {source.documents?.some(doc => doc.selected) && (
                                <>
                                  <p className="font-medium text-xs mt-2">Selected files:</p>
                                  <ul className="text-xs list-disc pl-4 mt-1">
                                    {source.documents.filter(doc => doc.selected).slice(0, 5).map((doc, i) => (
                                      <li key={i}>{doc.name}</li>
                                    ))}
                                    {source.documents.filter(doc => doc.selected).length > 5 && (
                                      <li>... and more</li>
                                    )}
                                  </ul>
                                </>
                              )}
                              
                              {source.knowledge_sources && source.knowledge_sources.some(ks => ks.selected || ks.is_selected) && (
                                <>
                                  <p className="font-medium text-xs mt-2">Selected imported files:</p>
                                  <ul className="text-xs list-disc pl-4 mt-1">
                                    {source.knowledge_sources.filter(ks => ks.selected || ks.is_selected).slice(0, 5).map((file, i) => (
                                      <li key={i}>{file.title || file.name}</li>
                                    ))}
                                    {source.knowledge_sources.filter(ks => ks.selected || ks.is_selected).length > 5 && (
                                      <li>... and more</li>
                                    )}
                                  </ul>
                                </>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  )})}
                  {agent.knowledgeSources.some(source => source.hasError) && (
                    <div className="w-full mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Needs retraining
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{agent.conversations.toLocaleString()}</TableCell>
              <TableCell>
                {agent.isDeployed ? (
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                    <Rocket className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                    Draft
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/agents/${agent.id}/test`}>
                      <Play className="h-4 w-4 mr-1" />
                      Test
                    </Link>
                  </Button>
                  <Button 
                    variant={agent.isDeployed ? "secondary" : "default"} 
                    size="sm"
                    onClick={() => openDeploymentDialog({id: agent.id, name: agent.name})}
                  >
                    {agent.isDeployed ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Deployed
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-1" />
                        Deploy
                      </>
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/agents/${agent.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedAgent && (
        <DeploymentDialog 
          open={deploymentDialogOpen} 
          onOpenChange={setDeploymentDialogOpen} 
          agent={selectedAgent} 
        />
      )}
    </>
  );
};

export default AgentTable;
