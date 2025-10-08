import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModernButton from '@/components/dashboard/ModernButton';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Building, 
  Globe, 
  Users, 
  Bot, 
  Calendar, 
  Phone, 
  Mail, 
  Settings,
  CreditCard,
  Activity,
  UserPlus,
  Edit,
  BarChart3,
  MessageSquare,
  Receipt,
  User,
  Zap,
  ZapOff
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useBusinessDetail } from '@/hooks/useBusinesses';
import { Icon } from '@/components/icons';

const BusinessDetail = () => {
  const { businessId } = useParams();
  const [activeAgentTab, setActiveAgentTab] = useState('human');
  
  // Refs for scroll sections
  const overviewRef = useRef<HTMLDivElement>(null);
  const agentsRef = useRef<HTMLDivElement>(null);
  const analyticsRef = useRef<HTMLDivElement>(null);
  const conversationsRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);
  
  const { data: businessData, isLoading, isError, error } = useBusinessDetail(businessId);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const agentTabs = [
    { id: 'human', label: 'Human Agents' },
    { id: 'ai', label: 'AI Agents' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div className="container max-w-7xl mx-auto p-6 space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          
          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-2xl">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="rounded-2xl">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !businessData) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div className="container max-w-7xl mx-auto p-6 space-y-8">
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <div className="text-center py-10">
                <div className="text-destructive mb-2">
                  {isError ? 'Error loading business details' : 'Business not found'}
                </div>
                <p className="text-muted-foreground">
                  {error instanceof Error ? error.message : 'The requested business could not be found.'}
                </p>
                <ModernButton asChild className="mt-4">
                  <Link to="/businesses">Back to Businesses</Link>
                </ModernButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Extract business info from the detailed response
  const business = {
    name: businessData.business_info.name,
    domain: businessData.business_info.domain,
    plan: businessData.subscription.plan,
    status: businessData.subscription.status,
    admins: businessData.account_statistics.admins,
    agents: businessData.account_statistics.agents,
    created: businessData.business_info.account_created,
    email: businessData.business_info.email,
    phone: businessData.business_info.phone
  };

    const conversationData = [
    { week: 'W1', conversations: 2800 },
    { week: 'W2', conversations: 3200 },
    { week: 'W3', conversations: 3500 },
    { week: 'W4', conversations: 3700 },
    { week: 'W5', conversations: 3400 },
    { week: 'W6', conversations: 3800 },
    { week: 'W7', conversations: 4100 },
    { week: 'W8', conversations: 4500 }
  ];

  return (
    <div className="min-h-screen bg-neutral-100/50 dark:bg-[hsla(0,0%,0%,0.95)]">
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ModernButton variant="ghost" size="sm" asChild>
              <Link to="/businesses" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </ModernButton>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
                {business.name || 'Business Name'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ModernButton variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Business
            </ModernButton>
            <ModernButton size="sm">
              <ZapOff className="h-4 w-4 mr-2" />
              Disable
            </ModernButton>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Scrollable Content */}
          <div className="lg:col-span-2 space-y-8 overflow-y-auto">
            {/* Business Overview */}
            <div ref={overviewRef}>
              <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg pl-0 font-semibold text-neutral-900 dark:text-neutral-100">
                    Business Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-transparent rounded-xl flex items-center justify-start bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3">
                          <Globe className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Domain</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {business.domain || 'No domain set'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="bg-transparent rounded-xl flex items-center justify-start bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3">
                          <Users className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Admins</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {business.admins} administrator{business.admins !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="bg-transparent rounded-xl flex items-center justify-start bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3">
                          <Bot className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Agents</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {business.agents} active agent{business.agents !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-transparent rounded-xl flex items-center justify-start bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3">
                          <Calendar className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Created</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {new Date(business.created).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="bg-transparent rounded-xl flex items-center justify-start bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3">
                          <CreditCard className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Current Plan</p>
                          <Badge 
                            variant={
                              business.plan?.toLowerCase() === 'premium' ? 'default' : 
                              business.plan?.toLowerCase() === 'pro' ? 'secondary' : 
                              'outline'
                            } 
                            className="capitalize mt-1"
                          >
                            {business.plan === 'None' || !business.plan ? 'Free' : business.plan}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="bg-transparent rounded-xl flex items-center justify-start bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3">
                          <Activity className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Status</p>
                          <Badge 
                            variant={
                              business.status?.toLowerCase() === 'active' ? 'success' : 
                              business.status?.toLowerCase() === 'trial' ? 'secondary' : 
                              'outline'
                            }
                            className="mt-1"
                          >
                            {business.status === 'None' || !business.status ? 'New' : business.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Agents Section */}
            <div ref={agentsRef}>
              <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg pl-0 font-semibold text-neutral-900 dark:text-neutral-100">
                      Team & Agents
                    </CardTitle>
                    <ModernTabNavigation
                      tabs={agentTabs}
                      activeTab={activeAgentTab}
                      onTabChange={setActiveAgentTab}
                      className="text-xs"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {activeAgentTab === 'human' ? (
                    <div className="space-y-4">
                      {businessData.administrators.map((admin) => (
                        <div key={admin.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/30 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900 dark:text-neutral-100">{admin.name}</p>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">{admin.email}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {admin.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {businessData.agents.map((agent) => (
                        <div key={agent.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/30 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900 dark:text-neutral-100">{agent.name}</p>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">{agent.agentType}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={agent.status === 'active' ? 'default' : 'outline'}
                              className="capitalize"
                            >
                              {agent.status}
                            </Badge>
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                              {agent.conversations} chats
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Analytics Section */}
            <div ref={analyticsRef}>
              <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg pl-0 font-semibold text-neutral-900 dark:text-neutral-100">
                    Analytics Overview
                  </CardTitle>
                  <CardDescription>
                    Current month's performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {businessData.account_statistics.conversations}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">Conversations</div>
                    </div>
                    <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {business.admins + business.agents}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">Active Users</div>
                    </div>
                    <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {businessData.account_statistics.documents}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">Knowledge Sources</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conversations Volume Chart */}
            <div ref={conversationsRef}>
              <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg pl-0 font-semibold text-neutral-900 dark:text-neutral-100">
                    Conversations Volume
                  </CardTitle>
                  <CardDescription>
                    Daily conversation trends over the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={conversationData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="conversationGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                        <XAxis 
                          dataKey="week" 
                          tick={{ fontSize: 12, fill: 'currentColor' }}
                          className="text-neutral-600 dark:text-neutral-400"
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: 'currentColor' }}
                          className="text-neutral-600 dark:text-neutral-400"
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                           contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                            color: 'hsl(var(--foreground))',
                            fontSize: '12px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="conversations" 
                          stroke="#8884d8" 
                          fill="url(#conversationGradient)" 
                          fillOpacity={1} 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment History */}
            <div ref={paymentRef}>
              <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg pl-0 font-semibold text-neutral-900 dark:text-neutral-100">
                    Payment History
                  </CardTitle>
                  <CardDescription>
                    Recent billing and subscription changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-transparent rounded-xl flex items-center justify-start bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3">
                          <Icon name={`Star`} color='hsl(var(--primary))' type='plain' />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            {business.plan === 'None' || !business.plan ? 'Free Plan' : `${business.plan} Plan`}
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Current subscription</p>
                        </div>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <span className="text-neutral-600 dark:text-neutral-400">Next billing</span>
                      <span className="text-neutral-900 dark:text-neutral-100">
                        {businessData.subscription.next_billing_date ? 
                          new Date(businessData.subscription.next_billing_date).toLocaleDateString() : 
                          'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <span className="text-neutral-600 dark:text-neutral-400">Billing cycle</span>
                      <span className="text-neutral-900 dark:text-neutral-100 capitalize">
                        {businessData.subscription.billing_cycle || 'Monthly'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:sticky lg:top-6 lg:h-fit space-y-6">
            {/* Quick Links */}
            <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg pl-0 font-semibold text-neutral-900 dark:text-neutral-100">
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => scrollToSection(overviewRef)}
                  className="w-full text-left px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 rounded-lg transition-colors"
                >
                  <BarChart3 className="h-4 w-4 inline mr-2" />
                  Business Overview
                </button>
                <button
                  onClick={() => scrollToSection(agentsRef)}
                  className="w-full text-left px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 rounded-lg transition-colors"
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  Team & Agents
                </button>
                <button
                  onClick={() => scrollToSection(analyticsRef)}
                  className="w-full text-left px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 rounded-lg transition-colors"
                >
                  <Activity className="h-4 w-4 inline mr-2" />
                  Analytics
                </button>
                <button
                  onClick={() => scrollToSection(conversationsRef)}
                  className="w-full text-left px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 rounded-lg transition-colors"
                >
                  <MessageSquare className="h-4 w-4 inline mr-2" />
                  Conversations
                </button>
                <button
                  onClick={() => scrollToSection(paymentRef)}
                  className="w-full text-left px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 rounded-lg transition-colors"
                >
                  <CreditCard className="h-4 w-4 inline mr-2" />
                  Payment History
                </button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg pl-0 font-semibold text-neutral-900 dark:text-neutral-100">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Email</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {business.email || `contact@${business.domain || 'business.com'}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Phone</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {business.phone || '+1 (555) 123-4567'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg pl-0 font-semibold text-neutral-900 dark:text-neutral-100">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 bg-neutral-50 dark:bg-neutral-800/30 rounded-lg">
                    <span className="text-neutral-600 dark:text-neutral-400">Last login</span>
                    <span className="text-neutral-900 dark:text-neutral-100">2 hours ago</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-neutral-50 dark:bg-neutral-800/30 rounded-lg">
                    <span className="text-neutral-600 dark:text-neutral-400">Agents updated</span>
                    <span className="text-neutral-900 dark:text-neutral-100">1 day ago</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-neutral-50 dark:bg-neutral-800/30 rounded-lg">
                    <span className="text-neutral-600 dark:text-neutral-400">Plan changed</span>
                    <span className="text-neutral-900 dark:text-neutral-100">1 week ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetail;
