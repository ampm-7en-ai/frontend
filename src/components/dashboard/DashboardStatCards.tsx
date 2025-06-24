
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
      bgGradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Conversations',
      value: conversations,
      icon: MessageSquare,
      change: '+8%',
      trend: 'up',
      color: 'green',
      bgGradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Knowledge Base',
      value: knowledgeBase,
      icon: Book,
      change: '+15%',
      trend: 'up',
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Team Members',
      value: teamMembers,
      icon: Users,
      change: '+3%',
      trend: 'up',
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
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
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.bgGradient} shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStatCards;
