import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, loading }) => (
  <div className="stat-card bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center min-w-[160px] min-h-[180px]">
    {icon && <div className="mb-2 text-3xl text-blue-500">{icon}</div>}
    <div className="text-2xl font-bold mb-1">
      {loading ? <span className="animate-pulse">...</span> : value}
    </div>
    <div className="text-gray-500 text-sm">{title}</div>
  </div>
);

export default StatCard;
