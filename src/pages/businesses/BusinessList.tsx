import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Building, Check, ChevronRight, Filter, Plus, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useBusinesses } from '@/hooks/useBusinesses';
import { Skeleton } from '@/components/ui/skeleton';

const BusinessList = () => {
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data: businesses, isLoading, isError, error } = useBusinesses();

  // Filter businesses based on search query and status filter
  const filteredBusinesses = businesses?.filter(business => {
    const trimName = business.name === null ? 'business': business.name.toLowerCase();
    const trimDomain = business.domain === null ? 'domain' : business.domain.toLowerCase();
    const matchesSearch = trimName.includes(searchQuery.toLowerCase()) || 
                          (trimDomain && trimDomain.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || business.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];


  if (isError) {
    return (
      <Card className="my-6">
        <CardContent className="p-6">
          <div className="text-center py-10">
            <div className="text-destructive mb-2">Error loading businesses</div>
            <p className="text-muted-foreground">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
            <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
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
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger variant="modern" className="w-36">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent variant="modern">
              <SelectItem variant="modern" value="all">All Status</SelectItem>
              <SelectItem variant="modern" value="active">Active</SelectItem>
              <SelectItem variant="modern" value="trial">Trial</SelectItem>
              <SelectItem variant="modern" value="inactive">Inactive</SelectItem>
              <SelectItem variant="modern" value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader className="px-6">
          <div className="flex justify-between items-center">
            <CardTitle>All Businesses</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `${filteredBusinesses.length} businesses total`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-6">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="flex items-center space-x-4 py-2">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Users</TableHead>
                    <TableHead className="text-center">AI Agents</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchQuery || statusFilter !== 'all' ? 
                          'No businesses found matching your search criteria.' : 
                          'No businesses available.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBusinesses.map((business) => (
                      <TableRow key={business.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-2 rounded">
                              <Building className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div>{business.name || 'Business Name'}</div>
                              <div className="text-xs text-muted-foreground">{business.domain || 'No domain'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {business.plan === 'None' ? 'Free' : business.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`${
                              business.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                              business.status.toLowerCase() === 'trial' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
                              business.status.toLowerCase() === 'none' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' :
                              'bg-gray-100 text-gray-800 hover:bg-gray-100'
                            }`}
                          >
                            {business.status.toLowerCase() === 'active' ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : business.status.toLowerCase() === 'trial' ? (
                              <div className="h-2 w-2 rounded-full bg-blue-500 mr-1" />
                            ) : (
                              <></>
                            )}
                            {business.status === 'None' ? 'New' : business.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{business.admins}</TableCell>
                        <TableCell className="text-center">{business.agents}</TableCell>
                        <TableCell className="text-right">
                          {new Date(business.created).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/businesses/${business.id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessList;
