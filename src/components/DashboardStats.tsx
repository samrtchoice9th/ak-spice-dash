
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Stat {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

interface DashboardStatsProps {
  stats: Stat[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-card rounded-lg shadow-lg p-4 sm:p-6 border border-border">
          <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.color} mb-3 sm:mb-4`}>
            <stat.icon size={20} className="sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">{stat.title}</h3>
          <p className="text-lg sm:text-2xl font-bold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};
