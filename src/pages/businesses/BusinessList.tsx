
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building, Check, ChevronRight, Filter, Search, Globe, Users, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useBusinesses } from '@/hooks/useBusinesses';
import BusinessStatCards from '@/components/businesses/BusinessStatCards';

const BusinessList = () => {
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Business Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all businesses on your platform
            </p>
          </div>
        </div>

        {/* Business Stats Cards */}
        <BusinessStatCards businesses={businesses} />

        {/* Search and Filter Controls */}
        <Card className="bg-white dark:bg-gray-800/50 border-0 rounded-3xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Input 
                  placeholder="Search businesses..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-2xl border-slate-200 dark:border-slate-700" 
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex gap-2">
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-36 rounded-2xl border-slate-200 dark:border-slate-700">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Business List */}
        <Card className="bg-white dark:bg-gray-800/50 border-0 rounded-3xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                All Businesses
              </CardTitle>
              <CardDescription>
                {isLoading ? 'Loading...' : `${filteredBusinesses.length} businesses total`}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-3 w-[200px]" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBusinesses.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Building className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-lg font-medium mb-2">No businesses found</p>
                    <p className="text-sm">
                      {searchQuery || statusFilter !== 'all' ? 
                        'No businesses match your search criteria.' : 
                        'No businesses available.'}
                    </p>
                  </div>
                ) : (
                  filteredBusinesses.map((business) => (
                    <div
                      key={business.id}
                      className="flex items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200 group"
                    >
                      {/* Business Icon and Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0">
                          <Building className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {business.name || 'Business Name'}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                              <Globe className="h-3 w-3" />
                              <span className="truncate">{business.domain || 'No domain'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                              <Users className="h-3 w-3" />
                              <span>{business.admins} admins</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                              <Bot className="h-3 w-3" />
                              <span>{business.agents} agents</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Plan Badge */}
                      <div className="flex items-center gap-3 mr-4">
                        <Badge variant="outline" className="capitalize text-xs px-2 py-1 rounded-full">
                          {business.plan === 'None' ? 'Free' : business.plan}
                        </Badge>
                        
                        {/* Status Badge */}
                        <Badge 
                          className={`text-xs px-2 py-1 rounded-full ${
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
                      </div>

                      {/* Created Date */}
                      <div className="text-sm text-slate-500 dark:text-slate-400 mr-4 min-w-0">
                        {new Date(business.created).toLocaleDateString()}
                      </div>

                      {/* Action Button */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        asChild
                      >
                        <Link to={`/businesses/${business.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessList;
