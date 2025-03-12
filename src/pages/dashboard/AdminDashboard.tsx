
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, MessageSquare, ChevronRight, Book, Users, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Bot className="mr-2 h-4 w-4 text-primary" />
              My Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">All active agents</p>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                <Link to="/agents" className="flex items-center">
                  View all <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-primary" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">128</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">Last 30 days</p>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                <Link to="/conversations" className="flex items-center">
                  View all <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Book className="mr-2 h-4 w-4 text-primary" />
              Knowledge Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">Documents</p>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                <Link to="/knowledge" className="flex items-center">
                  Manage <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-4 w-4 text-primary" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">7</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">Domain experts</p>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                <Link to="/settings/business/team" className="flex items-center">
                  Manage <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
            <CardDescription>Customer interactions in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 'c1', user: 'John Doe', time: '2 hours ago', satisfaction: 'high', messages: 12 },
                { id: 'c2', user: 'Jane Smith', time: '5 hours ago', satisfaction: 'medium', messages: 8 },
                { id: 'c3', user: 'Alex Johnson', time: '1 day ago', satisfaction: 'high', messages: 15 },
                { id: 'c4', user: 'Sarah Williams', time: '2 days ago', satisfaction: 'low', messages: 6 },
              ].map((conversation) => (
                <div key={conversation.id} className="flex items-center justify-between p-3 border border-border rounded-md bg-card/50 hover:bg-accent/5 transition-colors">
                  <div>
                    <h3 className="font-medium text-sm">{conversation.user}</h3>
                    <p className="text-xs text-muted-foreground">{conversation.time}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm">{conversation.messages} messages</div>
                      <div className={`text-xs ${
                        conversation.satisfaction === 'high' ? 'text-green-600' : 
                        conversation.satisfaction === 'medium' ? 'text-amber-600' : 
                        'text-red-600'
                      }`}>
                        {conversation.satisfaction.charAt(0).toUpperCase() + conversation.satisfaction.slice(1)} satisfaction
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                      <Link to={`/conversations/${conversation.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" asChild>
                <Link to="/conversations">View All Conversations</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="mr-2 h-5 w-5" />
              Performance
            </CardTitle>
            <CardDescription>Agent usage metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="usage">
              <TabsList className="mb-4">
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
              </TabsList>
              <TabsContent value="usage" className="h-[250px] flex items-center justify-center bg-muted/20 rounded-md">
                [Usage Chart]
              </TabsContent>
              <TabsContent value="satisfaction" className="h-[250px] flex items-center justify-center bg-muted/20 rounded-md">
                [Satisfaction Chart]
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
