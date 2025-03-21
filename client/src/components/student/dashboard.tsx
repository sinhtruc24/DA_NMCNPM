import { useQuery } from "@tanstack/react-query";
import { Activity, Registration } from "@shared/schema";
import { StatsCards } from "./stats-cards";
import { PointsChart } from "./points-chart";
import { ActivityList } from "./activity-list";
import { Calendar } from "./calendar";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function StudentDashboard() {
  const { user } = useAuth();

  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: registrations, isLoading: registrationsLoading } = useQuery<Registration[]>({
    queryKey: ["/api/registrations"],
  });

  const { data: pointsSummary, isLoading: pointsSummaryLoading } = useQuery<{
    totalPoints: number;
    rank: string;
    monthlyPoints: { month: string; points: number }[];
    completedActivities: number;
  }>({
    queryKey: ["/api/points/summary"],
  });

  const isLoading = activitiesLoading || registrationsLoading || pointsSummaryLoading;

  // Filter upcoming activities (those with registrations)
  const upcomingActivities = activities && registrations
    ? activities.filter(activity => 
        registrations.some(reg => 
          reg.activityId === activity.id && 
          ["approved", "pending"].includes(reg.status) && 
          new Date(activity.endDate) >= new Date()
        )
      ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tổng quan</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Xem các thông tin về hoạt động và điểm rèn luyện của bạn
        </p>
      </div>

      {pointsSummary && registrations && (
        <StatsCards 
          currentPoints={pointsSummary.totalPoints} 
          completedActivities={pointsSummary.completedActivities} 
          pendingActivities={registrations.filter(r => r.status === "pending").length}
          rank={pointsSummary.rank}
        />
      )}

      {pointsSummary && (
        <div className="mt-8">
          <PointsChart monthlyPoints={pointsSummary.monthlyPoints} />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityList activities={upcomingActivities} registrations={registrations || []} />
        </div>
        <div>
          <Calendar activities={activities || []} registrations={registrations || []} />
        </div>
      </div>
    </div>
  );
}
