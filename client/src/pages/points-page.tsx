import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Activity, Registration } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PointsChart } from "@/components/student/points-chart";
import { StatsCards } from "@/components/student/stats-cards";
import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Award } from "lucide-react";

export default function PointsPage() {
  const { user } = useAuth();

  // Get points summary data
  const { data: pointsSummary, isLoading: pointsSummaryLoading } = useQuery<{
    totalPoints: number;
    rank: string;
    monthlyPoints: { month: string; points: number }[];
    completedActivities: number;
  }>({
    queryKey: ["/api/points/summary"],
  });

  // Get activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  // Get registrations
  const { data: registrations, isLoading: registrationsLoading } = useQuery<Registration[]>({
    queryKey: ["/api/registrations"],
  });

  const isLoading = pointsSummaryLoading || activitiesLoading || registrationsLoading;

  // Get completed registrations
  const completedRegistrations = registrations
    ?.filter(reg => reg.status === "completed" && reg.pointsAwarded !== null)
    .sort((a, b) => {
      // Sort by updated date, newest first
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    }) || [];

  // Get activity details
  const getActivityDetails = (activityId: number) => {
    return activities?.find(a => a.id === activityId);
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Điểm rèn luyện</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Theo dõi và quản lý điểm rèn luyện của bạn
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {pointsSummary && registrations && (
            <StatsCards 
              currentPoints={pointsSummary.totalPoints} 
              completedActivities={pointsSummary.completedActivities} 
              pendingActivities={registrations.filter(r => r.status === "pending").length}
              rank={pointsSummary.rank}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              {pointsSummary && (
                <PointsChart monthlyPoints={pointsSummary.monthlyPoints} />
              )}
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <Award className="h-5 w-5 mr-2 text-primary" />
                    Bảng xếp hạng điểm rèn luyện
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Xuất sắc:</span>
                      <span>90-100 điểm</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Tốt:</span>
                      <span>80-89 điểm</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Khá:</span>
                      <span>65-79 điểm</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Trung bình:</span>
                      <span>50-64 điểm</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Yếu:</span>
                      <span>35-49 điểm</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Kém:</span>
                      <span>&lt; 35 điểm</span>
                    </div>
                  </div>
                  {pointsSummary && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-center text-gray-700 dark:text-gray-300">
                        Xếp loại hiện tại của bạn: <span className="font-bold text-primary">{pointsSummary.rank}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                Lịch sử hoạt động và điểm rèn luyện
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedRegistrations.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  Bạn chưa tham gia hoạt động nào
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hoạt động</TableHead>
                        <TableHead>Ngày tham gia</TableHead>
                        <TableHead>Điểm đạt được</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedRegistrations.map((registration) => {
                        const activity = getActivityDetails(registration.activityId);
                        if (!activity) return null;

                        return (
                          <TableRow key={registration.id}>
                            <TableCell className="font-medium">{activity.title}</TableCell>
                            <TableCell>
                              {format(new Date(activity.startDate), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell>{registration.pointsAwarded}</TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Đã hoàn thành
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </MainLayout>
  );
}
