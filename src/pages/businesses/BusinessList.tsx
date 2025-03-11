
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Building,
  ChevronDown, 
  MoreHorizontal, 
  Plus, 
  Search,
  Users,
} from 'lucide-react';

// Mock data for businesses
const mockBusinesses = [
  {
    id: 'b1',
    name: 'TechNova Solutions',
    industry: 'Technology',
    subscription: 'Enterprise',
    status: 'Active',
    agents: 12,
    users: 24,
    lastActive: '2 minutes ago',
  },
  {
    id: 'b2',
    name: 'MediaWorks Agency',
    industry: 'Marketing',
    subscription: 'Professional',
    status: 'Active',
    agents: 8,
    users: 15,
    lastActive: '1 hour ago',
  },
  {
    id: 'b3',
    name: 'HealthPlus Medical',
    industry: 'Healthcare',
    subscription: 'Enterprise',
    status: 'Inactive',
    agents: 5,
    users: 18,
    lastActive: '2 days ago',
  },
  {
    id: 'b4',
    name: 'FinEdge Consulting',
    industry: 'Finance',
    subscription: 'Professional',
    status: 'Active',
    agents: 10,
    users: 30,
    lastActive: '3 hours ago',
  },
  {
    id: 'b5',
    name: 'EduLearn Systems',
    industry: 'Education',
    subscription: 'Starter',
    status: 'Trial',
    agents: 3,
    users: 7,
    lastActive: '4 hours ago',
  },
];

const BusinessList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'trial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter businesses based on search and status
  const filteredBusinesses = mockBusinesses.filter((business) => {
    const matchesSearch = 
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      business.industry.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || business.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout 
      pageTitle="Business Management" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Businesses', href: '/businesses' }
      ]}
    >
      <div className="space-y-6">
        {/* Header section with search and actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
              <Input
                type="search"
                placeholder="Search businesses..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full md:w-auto">
            <Building className="mr-2 h-3.5 w-3.5" />
            Add Business
          </Button>
        </div>

        {/* Business table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agents</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBusinesses.map((business) => (
                <TableRow key={business.id}>
                  <TableCell>
                    <div className="font-semibold">
                      <Link to={`/businesses/${business.id}`} className="hover:underline">
                        {business.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>{business.industry}</TableCell>
                  <TableCell>
                    <Badge variant={business.subscription === 'Enterprise' ? 'default' : 'secondary'}>
                      {business.subscription}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(business.status)}>
                      {business.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{business.agents}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      {business.users}
                    </div>
                  </TableCell>
                  <TableCell>{business.lastActive}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/businesses/${business.id}`}>View details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit business</DropdownMenuItem>
                        <DropdownMenuItem>Manage users</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredBusinesses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No businesses found matching your search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </MainLayout>
  );
};

export default BusinessList;
