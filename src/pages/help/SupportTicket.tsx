
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  HelpCircle, 
  PlusCircle, 
  Search, 
  Paperclip, 
  ChevronDown, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock tickets data
const mockTickets = [
  {
    id: 'TKT-1001',
    subject: 'Unable to create new agent workflow',
    status: 'Open',
    priority: 'High',
    category: 'Agent Management',
    created: '2023-07-15',
    lastUpdated: '2023-07-16',
    assignee: 'Support Team'
  },
  {
    id: 'TKT-1002',
    subject: 'Question about API rate limits',
    status: 'In Progress',
    priority: 'Medium',
    category: 'API',
    created: '2023-07-10',
    lastUpdated: '2023-07-15',
    assignee: 'John Müller'
  },
  {
    id: 'TKT-1003',
    subject: 'Billing discrepancy in June invoice',
    status: 'Waiting for Customer',
    priority: 'Medium',
    category: 'Billing',
    created: '2023-07-05',
    lastUpdated: '2023-07-14',
    assignee: 'Finance Team'
  },
  {
    id: 'TKT-1004',
    subject: 'Feature request: Enhanced reporting',
    status: 'Under Review',
    priority: 'Low',
    category: 'Feature Request',
    created: '2023-06-28',
    lastUpdated: '2023-07-12',
    assignee: 'Product Team'
  },
  {
    id: 'TKT-1005',
    subject: 'Integration with external database fails',
    status: 'Resolved',
    priority: 'High',
    category: 'Integrations',
    created: '2023-06-20',
    lastUpdated: '2023-07-02',
    assignee: 'Integration Team'
  }
];

// Mock suggested articles
const suggestedArticles = [
  {
    id: 'art-1',
    title: 'Common Issues with Agent Workflows',
    url: '/help/documentation#agent-workflows',
    relevance: 'High'
  },
  {
    id: 'art-2',
    title: 'Troubleshooting Agent Configuration',
    url: '/help/documentation#configuring-agents',
    relevance: 'Medium'
  },
  {
    id: 'art-3',
    title: 'Understanding Workflow Permissions',
    url: '/help/documentation#workflow-permissions',
    relevance: 'Medium'
  }
];

const SupportTicket = () => {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Handle ticket subject change and show suggestions when typing
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTicketSubject(e.target.value);
    setShowSuggestions(e.target.value.length > 3);
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Open</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'Waiting for Customer':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Waiting for Customer</Badge>;
      case 'Under Review':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">Under Review</Badge>;
      case 'Resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100">{status}</Badge>;
    }
  };

  // Get priority badge styling
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="outline" className="bg-red-100 text-red-800">High</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100">{priority}</Badge>;
    }
  };

  // Filter tickets based on search
  const filteredTickets = mockTickets.filter(ticket => 
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle ticket submission
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit the ticket to the backend
    alert('Ticket submitted successfully!');
    // Reset form
    setTicketSubject('');
    setTicketDescription('');
    setTicketCategory('');
    setTicketPriority('medium');
  };

  return (
    <MainLayout 
      pageTitle="Support Tickets"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Help', href: '/help' },
        { label: 'Support', href: '/help/support' }
      ]}
    >
      <Tabs defaultValue="new">
        <TabsList className="mb-6">
          <TabsTrigger value="new">New Ticket</TabsTrigger>
          <TabsTrigger value="existing">My Tickets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Create Support Ticket
              </CardTitle>
              <CardDescription>
                Describe your issue and our support team will help you resolve it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="Briefly describe your issue" 
                    value={ticketSubject}
                    onChange={handleSubjectChange}
                    required
                  />
                  
                  {/* Knowledge base suggestions */}
                  {showSuggestions && (
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <h4 className="text-sm font-medium mb-2">These articles might help:</h4>
                      <ul className="space-y-2">
                        {suggestedArticles.map((article) => (
                          <li key={article.id}>
                            <a 
                              href={article.url} 
                              className="text-sm text-blue-600 hover:underline flex items-center"
                            >
                              <HelpCircle className="h-3 w-3 mr-1" />
                              {article.title}
                              <span className="ml-2 text-xs bg-muted-foreground/20 px-1 rounded">
                                {article.relevance} match
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={ticketCategory} onValueChange={setTicketCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent-management">Agent Management</SelectItem>
                        <SelectItem value="workflows">Workflows</SelectItem>
                        <SelectItem value="integrations">Integrations</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={ticketPriority} onValueChange={setTicketPriority} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Please provide as much detail as possible about your issue" 
                    className="h-32"
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Button type="button" variant="outline" className="mr-2">
                    <Paperclip className="h-4 w-4 mr-1" />
                    Attach Files
                  </Button>
                  <Button type="submit">Submit Ticket</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Common Solutions</CardTitle>
              <CardDescription>
                Quick answers to frequently asked questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium">How do I reset my password?</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Visit the login page and click "Forgot Password" to receive password reset instructions.
                  </p>
                </div>
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium">Why can't I create a new agent?</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Check your subscription limits and permissions. You may have reached your agent limit.
                  </p>
                </div>
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium">How do I connect a third-party service?</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Go to Settings > Integrations to connect external services and APIs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="existing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  My Support Tickets
                </span>
                <div className="flex items-center">
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search tickets..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell className="max-w-md truncate">
                          <a href="#" className="hover:underline text-blue-600">
                            {ticket.subject}
                          </a>
                        </TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell>{ticket.category}</TableCell>
                        <TableCell>{ticket.lastUpdated}</TableCell>
                      </TableRow>
                    ))}
                    {filteredTickets.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No tickets found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-6">
                <Button variant="outline" className="mr-2">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  View Resolved
                </Button>
                <Button variant="outline">
                  <Clock className="h-4 w-4 mr-1" />
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default SupportTicket;
