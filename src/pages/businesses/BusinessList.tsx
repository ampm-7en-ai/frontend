
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Check, ChevronRight, Search, Globe, Users, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useBusinesses } from '@/hooks/useBusinesses';
import BusinessStatCards from '@/components/businesses/BusinessStatCards';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernDropdown } from '@/components/ui/modern-dropdown';

const BusinessList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  
  const { data: businesses, isLoading, isError, error } = useBusinesses();

  // Filter businesses based on search query, status filter, and plan filter
  const filteredBusinesses = businesses?.filter(business => {
    const trimName = business.name === null ? 'business': business.name.toLowerCase();
    const trimDomain = business.domain === null ? 'domain' : business.domain.toLowerCase();
    const matchesSearch = trimName.includes(searchQuery.toLowerCase()) || 
                          (trimDomain && trimDomain.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || business.status.toLowerCase() === statusFilter;
    
    const businessPlan = business.plan?.toLowerCase() || 'none';
    const matchesPlan = planFilter === 'all' || 
                       (planFilter === 'free' && (businessPlan === 'none' || businessPlan === 'free')) ||
                       businessPlan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  }) || [];

  const statusOptions = [
    { value: 'all', label: 'All Status', description: 'Show all businesses' },
    { value: 'active', label: 'Active', description: 'Active businesses' },
    { value: 'trial', label: 'Trial', description: 'Trial businesses' },
    { value: 'inactive', label: 'Inactive', description: 'Inactive businesses' },
    { value: 'none', label: 'None', description: 'No status set' }
  ];

  const planOptions = [
    { value: 'all', label: 'All Plans', description: 'Show all plans' },
    { value: 'free', label: 'Free', description: 'Free plan businesses' },
    { value: 'standard', label: 'Standard', description: 'Standard plan businesses' },
    { value: 'enterprise', label: 'Enterprise', description: 'Enterprise plan businesses' }
  ];

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="container max-w-7xl mx-auto p-6 space-y-8">
          <Card className="my-6">
            <CardContent className="p-6">
              <div className="text-center py-10">
                <div className="text-destructive mb-2">Error loading businesses</div>
                <p className="text-muted-foreground">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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

        {/* Modern Search and Filter Controls */}
        <Card className="bg-white dark:bg-slate-800/50 border-0 rounded-3xl">
          <CardHeader>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <ModernInput
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                <ModernDropdown
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  options={statusOptions}
                  placeholder="Filter by status"
                  className="w-40"
                />
                <ModernDropdown
                  value={planFilter}
                  onValueChange={setPlanFilter}
                  options={planOptions}
                  placeholder="Filter by plan"
                  className="w-40"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Business List */}
        <Card className="bg-white dark:bg-slate-800/50 border-0 rounded-3xl">
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
                  <Card key={n} className="p-6 bg-slate-50 dark:bg-slate-800/30 border-0 rounded-2xl">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-5 w-[250px]" />
                        <div className="flex gap-4">
                          <Skeleton className="h-4 w-[120px]" />
                          <Skeleton className="h-4 w-[80px]" />
                          <Skeleton className="h-4 w-[100px]" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBusinesses.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Building className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-lg font-medium mb-2">No businesses found</p>
                    <p className="text-sm">
                      {searchQuery || statusFilter !== 'all' || planFilter !== 'all' ? 
                        'No businesses match your search criteria.' : 
                        'No businesses available.'}
                    </p>
                  </div>
                ) : (
                  filteredBusinesses.map((business) => (
                    <Link
                      key={business.id}
                      to={`/businesses/${business.id}`}
                      className="block"
                    >
                      <Card className="p-5 bg-slate-50 dark:bg-slate-800/30 border-0 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer group shadow-none">
                        <div className="flex items-center gap-4">
                          {/* Business Icon */}
                          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0">
                            <Building className="h-4 w-4 text-white" />
                          </div>

                          {/* Business Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-lg">
                              {business.name || 'Business Name'}
                            </h3>
                            
                          </div>

                          {/* Plan and Status Badges */}
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="capitalize text-xs px-3 py-1 rounded-full">
                              {business.plan === 'None' ? 'Free' : business.plan}
                            </Badge>
                            
                            <Badge 
                              variant={
                                business.status.toLowerCase() === 'active' ? 'success' : 
                                business.status.toLowerCase() === 'trial' ? 'default' : 
                                'secondary'
                              }
                              className="text-xs px-3 py-1 rounded-full"
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
                          <div className="text-sm text-slate-500 dark:text-slate-400 min-w-fit">
                            {new Date(business.created).toLocaleDateString()}
                          </div>

                          {/* Action Icon */}
                          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                        </div>
                      </Card>
                    </Link>
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
