
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Building, Check, ChevronRight, Filter, MoreHorizontal, Plus, Search, Trash, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const BusinessList = () => {
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample business data
  const businesses = [
    {
      id: 'b1',
      name: 'Acme Corporation',
      domain: 'acmecorp.com',
      plan: 'enterprise',
      status: 'active',
      admins: 5,
      agents: 12,
      createdAt: '2023-01-15',
    },
    {
      id: 'b2',
      name: 'TechStart Inc.',
      domain: 'techstart.io',
      plan: 'pro',
      status: 'active',
      admins: 3,
      agents: 8,
      createdAt: '2023-02-28',
    },
    {
      id: 'b3',
      name: 'Global Solutions',
      domain: 'globalsolutions.com',
      plan: 'enterprise',
      status: 'active',
      admins: 7,
      agents: 20,
      createdAt: '2022-11-10',
    },
    {
      id: 'b4',
      name: 'Innovative Labs',
      domain: 'innovativelabs.co',
      plan: 'starter',
      status: 'trial',
      admins: 2,
      agents: 3,
      createdAt: '2023-05-05',
    },
    {
      id: 'b5',
      name: 'Data Systems LLC',
      domain: 'datasystems.io',
      plan: 'pro',
      status: 'inactive',
      admins: 1,
      agents: 5,
      createdAt: '2023-04-12',
    },
    {
      id: 'b6',
      name: 'ModernTech Co.',
      domain: 'moderntech.com',
      plan: 'pro',
      status: 'active',
      admins: 4,
      agents: 10,
      createdAt: '2023-03-22',
    },
    {
      id: 'b7',
      name: 'Future Dynamics',
      domain: 'futuredynamics.ai',
      plan: 'enterprise',
      status: 'active',
      admins: 6,
      agents: 18,
      createdAt: '2022-12-05',
    },
  ];

  const filteredBusinesses = businesses.filter(business => 
    business.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    business.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBusiness = () => {
    if (newBusinessName.trim() === '') return;
    
    // In a real app, you would add the business to your backend
    console.log('Adding new business:', newBusinessName);
    
    // Close the dialog and reset the form
    setIsAddBusinessOpen(false);
    setNewBusinessName('');
  };
  
  return (
    <MainLayout 
      pageTitle="Businesses" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Businesses', href: '/businesses' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Input 
              placeholder="Search businesses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10" 
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-36">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isAddBusinessOpen} onOpenChange={setIsAddBusinessOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Business
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Business</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new business account.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input 
                      id="business-name" 
                      value={newBusinessName}
                      onChange={(e) => setNewBusinessName(e.target.value)}
                      placeholder="Enter business name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="business-domain">Domain</Label>
                    <Input id="business-domain" placeholder="example.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="business-plan">Subscription Plan</Label>
                    <Select defaultValue="starter">
                      <SelectTrigger id="business-plan">
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="pro">Professional</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddBusinessOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddBusiness}>Create Business</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card>
          <CardHeader className="px-6">
            <div className="flex justify-between items-center">
              <CardTitle>All Businesses</CardTitle>
              <CardDescription>{businesses.length} businesses total</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Admins</TableHead>
                  <TableHead className="text-center">Agents</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBusinesses.map((business) => (
                  <TableRow key={business.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded">
                          <Building className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div>{business.name}</div>
                          <div className="text-xs text-muted-foreground">{business.domain}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {business.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`${
                          business.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                          business.status === 'trial' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
                          'bg-gray-100 text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        {business.status === 'active' ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : business.status === 'trial' ? (
                          <div className="h-2 w-2 rounded-full bg-blue-500 mr-1" />
                        ) : (
                          <X className="h-3 w-3 mr-1" />
                        )}
                        {business.status.charAt(0).toUpperCase() + business.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{business.admins}</TableCell>
                    <TableCell className="text-center">{business.agents}</TableCell>
                    <TableCell className="text-right">
                      {new Date(business.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/businesses/${business.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4">
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
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default BusinessList;
