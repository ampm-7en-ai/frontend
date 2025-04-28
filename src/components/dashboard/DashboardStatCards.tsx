
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Bot, MessageSquare, ChevronRight, Book, Users } from 'lucide-react';

type DashboardStatCardsProps = {
  myAgents: number;
  conversations: number;
  knowledgeBase: number;
  teamMembers: number;
};



const DashboardStatCards = ({
  myAgents,
  conversations,
  knowledgeBase,
  teamMembers,
}: DashboardStatCardsProps) => {
  const userPermissions = JSON.parse(localStorage.getItem('user'))?.permission || {};
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Bot className="mr-2 h-4 w-4 text-primary" />
            My Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{myAgents}</div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">All active agents</p>
            {userPermissions.agents && (<Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
              <Link to="/agents" className="flex items-center">
                View all <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>)
            } 
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
          <div className="text-3xl font-bold">{conversations}</div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">Last 30 days</p>
            {userPermissions.conversation && (<Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
              <Link to="/conversations" className="flex items-center">
                View all <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>)}
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
          <div className="text-3xl font-bold">{knowledgeBase}</div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">Documents</p>
            {userPermissions.knowledgebase && (<Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
              <Link to="/knowledge" className="flex items-center">
                Manage <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>)}
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
          <div className="text-3xl font-bold">{teamMembers}</div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">Domain experts</p>
            {userPermissions.team && (<Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
              <Link to="/settings/business/team" className="flex items-center">
                Manage <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStatCards;
