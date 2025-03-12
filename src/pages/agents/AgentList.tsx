import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Settings, MessageSquare, MoreVertical, Edit, Trash2, Copy, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

const AgentList = () => {
  const agents = [
    { 
      id: '1', 
      name: 'Customer Support', 
      description: 'General customer support agent', 
      status: 'active',
      conversations: 1254,
      lastModified: '2023-12-10T14:30:00Z',
      averageRating: 4.8,
    },
    { 
      id: '2', 
      name: 'Product Specialist', 
      description: 'Technical product information and troubleshooting', 
      status: 'active',
      conversations: 856,
      lastModified: '2023-12-05T09:15:00Z',
      averageRating: 4.6,
    },
    { 
      id: '3', 
      name: 'Sales Assistant', 
      description: 'Helps with product recommendations and sales inquiries', 
      status: 'inactive',
      conversations: 532,
      lastModified: '2023-11-28T16:45:00Z',
      averageRating: 4.4,
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Agents</h1>
        <p className="text-muted-foreground">Manage and create your AI agents</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search agents..."
            className="w-[250px]"
          />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <span>Showing {agents.length} agents</span>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Bot size={16} className={agent.status === 'active' ? 'text-green-500' : 'text-gray-400'} />
                    {agent.name}
                  </CardTitle>
                  <CardDescription>{agent.description}</CardDescription>
                </div>
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
                      <Play className="h-4 w-4 mr-2" />
                      Test
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
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={agent.status === 'active' ? "default" : "secondary"} className="mt-1">
                    {agent.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Conversations</p>
                  <p className="font-medium mt-1">{agent.conversations.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 flex justify-between">
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/agents/${agent.id}/edit`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Link>
              </Button>
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Test Chat
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AgentList;
