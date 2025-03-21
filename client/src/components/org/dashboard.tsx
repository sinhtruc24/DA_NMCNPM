import { useQuery } from "@tanstack/react-query";
import { Activity, Registration, Complaint } from "@shared/schema";
import { ActivityTable } from "./activity-table";
import { PendingApprovals } from "./pending-approvals";
import { ComplaintsList } from "./complaints-list";
import { Loader2, Calendar, CheckCheck, ClipboardCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function OrgDashboard() {
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: registrations, isLoading: registrationsLoading } = useQuery<Registration[]>({
    queryKey: ["/api/registrations"],
  });

  const { data: complaints, isLoading: complaintsLoading } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
  });

  const isLoading = activitiesLoading || registrationsLoading || complaintsLoading;

  // Calculate stats
  const totalActivities = activities?.length || 0;
  const completedActivities = activities?.filter(a => a.status === "completed").length || 0;
  const pendingApprovals = registrations?.filter(r => r.status === "pending").length || 0;
  const pendingComplaints = complaints?.filter(c => c.status === "pending").length || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Quick stats cards data
  const statsCards = [
    {
      title: "Tổng số hoạt động",
      value: totalActivities,
      icon: <Calendar className="text-white" />,
      color: "bg-blue-500",
      link: "/activities",
    },
    {
      title: "Hoạt động đã kết thúc",
      value: completedActivities,
      icon: <CheckCheck className="text-white" />,
      color: "bg-green-500",
      link: "/activities?status=completed",
    },
    {
      title: "Chờ duyệt đăng ký",
      value: pendingApprovals,
      icon: <ClipboardCheck className="text-white" />,
      color: "bg-yellow-500",
      link: "/activities?pendingApprovals=true",
    },
    {
      title: "Khiếu nại chưa xử lý",
      value: pendingComplaints,
      icon: <AlertTriangle className="text-white" />,
      color: "bg-red-500",
      link: "/complaints",
    },
  ];

  // Filter activities - show only recent ones (not completed or completed recently)
  const recentActivities = activities
    ?.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 4) || [];

  // Get pending approvals
  const pendingApprovalsList = registrations?.filter(r => r.status === "pending").slice(0, 3) || [];

  // Get recent complaints
  const recentComplaints = complaints?.filter(c => c.status === "pending").slice(0, 2) || [];

  return (
    <div>
      <div className="flex items-center justify-between md:mb-8 mb-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Quản lý tổng quan các hoạt động và điểm rèn luyện</p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button asChild>
            <Link to="/create-activity">
              <Calendar className="mr-2 h-4 w-4" />
              Tạo hoạt động mới
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                    {stat.icon}
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {stat.title}
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          {stat.value}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                <div className="text-sm">
                  <Link to={stat.link} className="font-medium text-primary hover:text-blue-600">
                    Xem tất cả
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activities and Approvals */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Activities Table */}
        <div className="lg:col-span-2">
          <ActivityTable activities={recentActivities} />
        </div>

        {/* Pending Approval & Complaints */}
        <div className="space-y-6">
          <PendingApprovals registrations={pendingApprovalsList} />
          <ComplaintsList complaints={recentComplaints} />
        </div>
      </div>
    </div>
  );
}
