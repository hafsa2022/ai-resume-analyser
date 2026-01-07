import {useEffect} from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import AnalyticsCharts from "../components/dashboard/AnalyticsCharts";
import { useAnalyticsData } from "../lib/analytics";
import { usePuterStore } from "../lib/puter";
import { useNavigate } from "react-router";

const Dashboard = () => {
  const { data, loading } = useAnalyticsData();
  const { auth } = usePuterStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/auth?next=/dashboard");
    }
  }, [auth.isAuthenticated]);

  // if (!auth.isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* <StatCard title="Total Users" value={data?.totalUsers ?? 0} loading={loading} /> */}
        <StatCard title="Resumes Uploaded" value={data?.totalResumes ?? 0} loading={loading} />
        <StatCard title="Job Listings" value={data?.totalJobs ?? 0} loading={loading} />
        <StatCard title="AI Analyses" value={data?.totalAnalyses ?? 0} loading={loading} />
        <StatCard title="Match Success Rate" value={data ? `${data.matchSuccessRate}%` : 0} loading={loading} />
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading analytics...</div>
      ) : data ? (
        <AnalyticsCharts
          resumesPerJob={data.resumesPerJob}
          uploadsOverTime={data.uploadsOverTime}
          matchStats={data.matchStats}
        />
      ) : (
        <div className="text-center py-12 text-gray-400">No analytics data available.</div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
