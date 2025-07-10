import React, { useState } from 'react';
import { 
  Search, 
  PlusCircle, 
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
import { Card, CardContent } from '@/components/ui/card';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModernDropdown } from '@/components/ui/modern-dropdown';

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
  }
];

const UserList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const filteredUsers = domainExperts.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBusiness = selectedBusiness === 'all' || user.businessId === selectedBusiness;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesBusiness && matchesStatus;
  });

  const businessOptions = [
    { value: 'all', label: 'All Businesses' },
    { value: 'b1', label: 'Acme Corp' },
    { value: 'b2', label: 'Globex Industries' },
    { value: 'b3', label: 'Initech Solutions' },
    { value: 'b4', label: 'Soylent Corp' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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
              <Button variant="outline" size="sm" className="flex items-center">
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
                <ModernDropdown
                  value={selectedBusiness}
                  onValueChange={setSelectedBusiness}
                  options={businessOptions}
                  placeholder="All Businesses"
                  className="mt-1"
                />
              </div>
              
              <div className="p-2">
                <Label htmlFor="status-filter">Status</Label>
                <ModernDropdown
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  options={statusOptions}
                  placeholder="All Status"
                  className="mt-1"
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Expert
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
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
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No domain experts found matching your search criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 bg-primary/10 text-primary text-xs">
                            <AvatarFallback>{user.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{user.role}</div>
                      </TableCell>
                      <TableCell>
                        <Link to={`/businesses/${user.businessId}`} className="flex items-center text-primary hover:underline text-sm">
                          <Building className="mr-1 h-3 w-3" />
                          {user.business}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          user.status === 'active' ? 'default' :
                          user.status === 'inactive' ? 'secondary' : 'outline'
                        } className="text-xs">
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/users/${user.id}`} className="cursor-pointer">
                                <Edit2 className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              View Conversations
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className={user.status === 'active' ? 'text-destructive' : 'text-primary'}
                            >
                              {user.status === 'active' ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium">
    {children}
  </label>
);

export default UserList;
