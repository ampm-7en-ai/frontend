
import React from 'react';
import { Bot, MessageSquare, Book, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardStatCardsProps {
  myAgents: number;
  conversations: number;
  knowledgeBase: number;
  teamMembers: number;
}

const DashboardStatCards: React.FC<DashboardStatCardsProps> = ({
  myAgents,
  conversations,
  knowledgeBase,
  teamMembers,
}) => {
  const stats = [
    {
      title: 'My Agents',
      value: myAgents,
      icon: Bot,
      change: '+12%',
      trend: 'up',
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Conversations',
      value: conversations,
      icon: MessageSquare,
      change: '+8%',
      trend: 'up',
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Knowledge Base',
      value: knowledgeBase,
      icon: Book,
      change: '+15%',
      trend: 'up',
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Team Members',
      value: teamMembers,
      icon: Users,
      change: '+3%',
      trend: 'up',
      color: 'orange',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {stat.value.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">
                    vs last month
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-2xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStatCards;
