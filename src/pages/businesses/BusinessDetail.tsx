
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Building,
  Users,
  Bot,
  Book,
  Settings,
  CreditCard,
  LineChart,
  AlertTriangle,
  Calendar,
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit,
} from 'lucide-react';

// Mock business data
const businessData = {
  b1: {
    id: 'b1',
    name: 'TechNova Solutions',
    description: 'Enterprise software solutions focusing on AI and machine learning applications.',
    industry: 'Technology',
    subscription: 'Enterprise',
    status: 'Active',
    logo: '',
    website: 'technova.example.com',
    email: 'contact@technova.example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Innovation Way, San Francisco, CA 94107',
    createdAt: '2023-01-15',
    agents: 12,
    users: 24,
    storage: '84%',
    apiCalls: '12,456 / month',
    lastPayment: '$1,499 on May 1, 2023',
    nextBilling: 'June 1, 2023',
  },
  b2: {
    id: 'b2',
    name: 'MediaWorks Agency',
    description: 'Digital marketing and content creation agency specializing in brand development.',
    industry: 'Marketing',
    subscription: 'Professional',
    status: 'Active',
    logo: '',
    website: 'mediaworks.example.com',
    email: 'hello@mediaworks.example.com',
    phone: '+1 (555) 987-6543',
    address: '456 Creative Blvd, New York, NY 10001',
    createdAt: '2023-03-10',
    agents: 8,
    users: 15,
    storage: '56%',
    apiCalls: '8,765 / month',
    lastPayment: '$699 on May 5, 2023',
    nextBilling: 'June 5, 2023',
  },
};

const BusinessDetail = () => {
  const { id } = useParams<{ id: string }>();
  const business = businessData[id as keyof typeof businessData] || businessData.b1;

  return (
    <MainLayout 
      pageTitle={business.name} 
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Businesses', href: '/businesses' },
        { label: business.name, href: `/businesses/${business.id}` }
      ]}
    >
      <div className="space-y-6">
        {/* Business Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{business.name}</h1>
                <Badge variant={business.status === 'Active' ? 'default' : 'secondary'}>
                  {business.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">{business.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{business.industry}</Badge>
                <Badge variant="outline" className="font-semibold">{business.subscription} Plan</Badge>
                <span className="text-sm text-muted-foreground">Since {business.createdAt}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Manage Users</Button>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Business
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{business.users}</div>
                  <p className="text-xs text-muted-foreground">Total account users</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Bot className="h-4 w-4 mr-2" />
                    Agents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{business.agents}</div>
                  <p className="text-xs text-muted-foreground">Active AI agents</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Book className="h-4 w-4 mr-2" />
                    Storage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{business.storage}</div>
                  <p className="text-xs text-muted-foreground">Storage usage</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">API Usage</CardTitle>
                  <CardDescription>Monthly API calls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-semibold mb-2">{business.apiCalls}</div>
                  <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                    [API Usage Chart]
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                  <CardDescription>Business details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Website</p>
                      <a href={`https://${business.website}`} className="text-sm text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        {business.website}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <a href={`mailto:${business.email}`} className="text-sm text-blue-600 hover:underline">
                        {business.email}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm">{business.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm">{business.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subscription Details</CardTitle>
                <CardDescription>Plan and billing information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Plan</h3>
                    <p className="font-semibold">{business.subscription}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Payment</h3>
                    <p className="font-semibold">{business.lastPayment}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Next Billing Date</h3>
                    <p className="font-semibold">{business.nextBilling}</p>
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="flex justify-between">
                  <Button variant="outline" size="sm">View Invoices</Button>
                  <Button variant="default" size="sm">Manage Subscription</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Placeholder content for other tabs */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Users</CardTitle>
                <CardDescription>Users associated with this business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
                  [Business Users Table]
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Agents</CardTitle>
                <CardDescription>AI agents deployed for this business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
                  [Business Agents List]
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>Subscription and payment information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
                  [Billing History Table]
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Settings</CardTitle>
                <CardDescription>Configuration and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
                  [Business Settings Form]
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default BusinessDetail;
