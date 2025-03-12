import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MoreHorizontal, 
  ChevronDown, 
  UserPlus, 
  Users, 
  Filter, 
  Building, 
  CheckCircle2, 
  XCircle, 
  Edit2, 
  Trash2, 
  MessageSquare 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Sample domain expert data
const domainExperts = [
  {
    id: '1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    avatar: 'JD',
    role: 'Marketing Specialist',
    business: 'Acme Corp',
    businessId: 'b1',
    status: 'active',
    lastActive: '10 minutes ago',
    expertise: ['Content Marketing', 'Digital Marketing'],
    assignedConversations: 12
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john.smith@example.com',
    avatar: 'JS',
    role: 'Technical Support',
    business: 'Globex Industries',
    businessId: 'b2',
    status: 'active',
    lastActive: '2 hours ago',
    expertise: ['Software Troubleshooting', 'System Integration'],
    assignedConversations: 8
  },
  {
    id: '3',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    avatar: 'AJ',
    role: 'HR Manager',
    business: 'Initech Solutions',
    businessId: 'b3',
    status: 'inactive',
    lastActive: '2 days ago',
    expertise: ['Employee Relations', 'Talent Acquisition'],
    assignedConversations: 0
  },
  {
    id: '4',
    name: 'Bob Williams',
    email: 'bob.williams@example.com',
    avatar: 'BW',
    role: 'Sales Expert',
    business: 'Soylent Corp',
    businessId: 'b4',
    status: 'active',
    lastActive: '35 minutes ago',
    expertise: ['B2B Sales', 'Contract Negotiation'],
    assignedConversations: 15
  },
  {
    id: '5',
    name: 'Carol Davis',
    email: 'carol.davis@example.com',
    avatar: 'CD',
    role: 'Legal Advisor',
    business: 'Acme Corp',
    businessId: 'b1',
    status: 'pending',
    lastActive: 'Never',
    expertise: ['Contract Law', 'IP Rights'],
    assignedConversations: 0
  },
  {
    id: '6',
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    avatar: 'DW',
    role: 'Financial Analyst',
    business: 'Globex Industries',
    businessId: 'b2',
    status: 'active',
    lastActive: '1 day ago',
    expertise: ['Financial Planning', 'Investment Analysis'],
    assignedConversations: 3
  },
  {
    id: '7',
    name: 'Eva Martinez',
    email: 'eva.martinez@example.com',
    avatar: 'EM',
    role: 'Product Manager',
    business: 'Initech Solutions',
    businessId: 'b3',
    status: 'active',
    lastActive: '3 hours ago',
    expertise: ['Product Strategy', 'UX Design'],
    assignedConversations: 6
  }
];

const UserList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Filter users based on search query and filters
  const filteredUsers = domainExperts.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBusiness = selectedBusiness === 'all' || user.businessId === selectedBusiness;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesBusiness && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search domain experts..." 
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="p-2">
                <Label htmlFor="business-filter">Business</Label>
                <Select
                  value={selectedBusiness}
                  onValueChange={setSelectedBusiness}
                >
                  <SelectTrigger id="business-filter" className="mt-1">
                    <SelectValue placeholder="All Businesses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Businesses</SelectItem>
                    <SelectItem value="b1">Acme Corp</SelectItem>
                    <SelectItem value="b2">Globex Industries</SelectItem>
                    <SelectItem value="b3">Initech Solutions</SelectItem>
                    <SelectItem value="b4">Soylent Corp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger id="status-filter" className="mt-1">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Expert
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            All Experts
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center">
            <XCircle className="mr-2 h-4 w-4" />
            Inactive
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Assignments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No domain experts found matching your search criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 bg-primary/10 text-primary">
                              <AvatarFallback>{user.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{user.role}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.expertise.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-[10px] py-0">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link to={`/businesses/${user.businessId}`} className="flex items-center text-primary hover:underline">
                            <Building className="mr-1 h-3 w-3" />
                            {user.business}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            user.status === 'active' ? 'default' :
                            user.status === 'inactive' ? 'secondary' : 'outline'
                          }>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.lastActive}</TableCell>
                        <TableCell>
                          {user.assignedConversations > 0 ? (
                            <div className="flex items-center">
                              <MessageSquare className="mr-1.5 h-3 w-3 text-primary" />
                              <span>{user.assignedConversations}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link to={`/users/${user.id}`} className="cursor-pointer">
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                             
