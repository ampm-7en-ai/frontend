
import React from 'react';
import { Bot, MessageSquare, Users } from 'lucide-react';
import { ModernStatCard } from '@/components/ui/modern-stat-card';
import Person from '../icons/library/Person';
import Chat from '../icons/library/Chat';
import Book from '../icons/library/Book';
import Team from '../icons/library/Team';

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
      icon: Person,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      title: 'Conversations',
      value: conversations,
      icon: Chat,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      title: 'Knowledge Base',
      value: knowledgeBase,
      icon: Book,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      title: 'Team Members',
      value: teamMembers,
      icon: Team,
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <ModernStatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          gradient={stat.gradient}
        />
      ))}
    </div>
  );
};

export default DashboardStatCards;
