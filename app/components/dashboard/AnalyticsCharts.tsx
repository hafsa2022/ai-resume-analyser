import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

interface AnalyticsChartsProps {
  resumesPerJob: { job: string; count: number }[];
  uploadsOverTime: { date: string; count: number }[];
  matchStats: { name: string; value: number; color: string }[];
}

const AnalyticsCharts = ({ resumesPerJob = [], uploadsOverTime = [], matchStats = [] }: AnalyticsChartsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
    {/* Bar Chart: Resumes per Job */}
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-2">Resumes Analyzed per Job</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={resumesPerJob}>
          <XAxis dataKey="job" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
    {/* Line Chart: Resume Uploads Over Time */}
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-2">Resume Uploads Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={uploadsOverTime}>
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    {/* Pie Chart: Matched vs Unmatched */}
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-2">Matched vs Unmatched Resumes</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={matchStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
            {matchStats.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry?.color} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default AnalyticsCharts;
