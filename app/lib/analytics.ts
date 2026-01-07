// Analytics service using Puter KV data when available
import { useEffect, useState } from "react";
import { usePuterStore } from "./puter";

export interface AnalyticsData {
  // totalUsers: number;
  totalResumes: number;
  totalJobs: number;
  totalAnalyses: number;
  matchSuccessRate: number;
  resumesPerJob: { job: string; count: number }[];
  uploadsOverTime: { date: string; count: number }[];
  matchStats: { name: string; value: number; color: string }[];
}

/**
 * Read `resume:*` KV entries and compute analytics using `createdAt` and `ownerId` when available.
 */
export function useAnalyticsData() {
  const { kv, auth } = usePuterStore();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const compute = async () => {
      setLoading(true);
      try {
        const items = (await kv.list("resume:*", true)) as any[] | undefined;
        const resumes = (items || [])
          .map((i) => {
            try {
              return JSON.parse(i.value) as any;
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean) as any[];

        const totalResumes = resumes.length;
        const totalAnalyses = resumes.filter((r) => r.feedback).length;

        // jobs: unique jobTitle
        const jobSet = new Set<string>();
        resumes.forEach((r) => {
          if (r.jobTitle && typeof r.jobTitle === "string" && r.jobTitle.trim() !== "") jobSet.add(r.jobTitle.trim());
        });
        const totalJobs = jobSet.size;

        // users: check user:* keys, fallback to unique ownerId values
        let totalUsers = 0;
        // try {
        //   const users = (await kv.list("user:*", true)) as any[] | undefined;
        //   if (users && users.length > 0) totalUsers = users.length;
        //   else {
        //     const owners = new Set<string>();
        //     resumes.forEach((r) => { if (r.ownerId) owners.add(r.ownerId); });
        //     totalUsers = owners.size || (auth?.isAuthenticated ? 1 : 0);
        //   }
        // } catch (e) {
        //   const owners = new Set<string>();
        //   resumes.forEach((r) => { if (r.ownerId) owners.add(r.ownerId); });
        //   totalUsers = owners.size || (auth?.isAuthenticated ? 1 : 0);
        // }

        // match stats: treat overallScore >= 60 as matched
        const matchedCount = resumes.filter((r) => r.feedback && typeof r.feedback.overallScore === "number" && r.feedback.overallScore >= 70).length;
        const unmatchedCount = Math.max(0, totalAnalyses - matchedCount);

        // resumes per job
        const rpMap = new Map<string, number>();
        resumes.forEach((r) => {
          const job = r.jobTitle && r.jobTitle.trim() !== "" ? r.jobTitle.trim() : "Unknown";
          rpMap.set(job, (rpMap.get(job) || 0) + 1);
        });
        const resumesPerJob = Array.from(rpMap.entries()).map(([job, count]) => ({ job, count })).sort((a, b) => b.count - a.count);

        // uploads over time: if createdAt present, use exact dates; otherwise distribute by created order
        const dayMap = new Map<string, number>();
        const days = 14; // show last 14 days
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          dayMap.set(d.toISOString().slice(0, 10), 0);
        }

        resumes.forEach((r, idx) => {
          if (r.createdAt) {
            const d = new Date(r.createdAt).toISOString().slice(0, 10);
            if (dayMap.has(d)) dayMap.set(d, (dayMap.get(d) || 0) + 1);
          } else {
            // fallback: evenly distribute by index into window
            const keys = Array.from(dayMap.keys());
            const k = keys[idx % keys.length];
            dayMap.set(k, (dayMap.get(k) || 0) + 1);
          }
        });

        const uploadsOverTime = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }));

        const matchStats = [
          { name: "Matched", value: matchedCount, color: "#10b981" },
          { name: "Unmatched", value: unmatchedCount, color: "#ef4444" },
        ];

        const matchSuccessRate = totalAnalyses > 0 ? Math.round((matchedCount / totalAnalyses) * 100) : 0;

        const payload: AnalyticsData = {
          // totalUsers,
          totalResumes,
          totalJobs,
          totalAnalyses,
          matchSuccessRate,
          resumesPerJob,
          uploadsOverTime,
          matchStats,
        };

        if (mounted) {
          setData(payload);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setData(null);
          setLoading(false);
        }
      }
    };

    compute();
    const interval = setInterval(() => compute(), 9000000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [kv, auth]);

  return { data, loading };
}
