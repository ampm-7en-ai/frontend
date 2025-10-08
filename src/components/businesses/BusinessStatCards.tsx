
import React from 'react';
import { ModernStatCard } from '@/components/ui/modern-stat-card';
import { Building, Check, Clock, CreditCard, Users } from 'lucide-react';

interface BusinessStatCardsProps {
  businesses?: any[];
}

const BusinessStatCards: React.FC<BusinessStatCardsProps> = ({ businesses = [] }) => {
  const stats = React.useMemo(() => {
    const result = {
      free: 0,
      standard: 0,
      enterprise: 0,
      active: 0,
      inactive: 0
    };

    businesses.forEach(business => {
      // Count by plan
      const plan = business.plan?.toLowerCase() || 'none';
      if (plan === 'none' || plan === 'free') {
        result.free++;
      } else if (plan === 'standard') {
        result.standard++;
      } else if (plan === 'enterprise') {
        result.enterprise++;
      }

      // Count by status
      const status = business.status?.toLowerCase() || 'inactive';
      if (status === 'active' || status === 'trial') {
        result.active++;
      } else {
        result.inactive++;
      }
    });

    return result;
  }, [businesses]);

  const statItems = [
    {
      title: 'Free Plan',
      value: stats.free,
      gradient: 'bg-gradient-to-br from-gray-500 to-gray-600'
    },
    {
      title: 'Standard Plan',
      value: stats.standard,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      title: 'Enterprise Plan',
      value: stats.enterprise,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      title: 'Active',
      value: stats.active,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      title: 'Inactive',
      value: stats.inactive,
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statItems.map((stat, index) => (
        <ModernStatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={null}
          gradient={stat.gradient}
        />
      ))}
    </div>
  );
};

export default BusinessStatCards;
