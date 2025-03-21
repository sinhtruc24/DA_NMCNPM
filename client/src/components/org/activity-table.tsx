import { Activity } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

type ActivityTableProps = {
  activities: Activity[];
};

export function ActivityTable({ activities }: ActivityTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Get activity registrations
  const { data: registrations } = useQuery({
    queryKey: ["/api/registrations"],
  });

  // Filter activities based on status
  const filteredActivities = statusFilter === "all"
    ? activities
    : activities.filter(activity => activity.status === statusFilter);

  // Get registration count for an activity
  const getRegistrationCount = (activityId: number) => {
    if (!registrations) return "0/0";
    const count = registrations.filter(r => r.activityId === activityId).length;
    return `${count}/${activities.find(a => a.id === activityId)?.maxParticipants || "∞"}`;
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Bản nháp</Badge>;
      case "open":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Đang mở đăng ký</Badge>;
      case "closed":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Chưa bắt đầu</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Đã kết thúc</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Lên kế hoạch</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
            Hoạt động gần đây
          </CardTitle>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Các hoạt động đang diễn ra hoặc sắp diễn ra
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="draft">Bản nháp</SelectItem>
              <SelectItem value="open">Đang mở đăng ký</SelectItem>
              <SelectItem value="closed">Chưa bắt đầu</SelectItem>
              <SelectItem value="completed">Đã kết thúc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hoạt động</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Đăng ký</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Chỉnh sửa</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Không có hoạt động nào
                  </td>
                </tr>
              ) : (
                filteredActivities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{activity.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {format(new Date(activity.startDate), "dd/MM/yyyy")}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(activity.startDate), "HH:mm")} - {format(new Date(activity.endDate), "HH:mm")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(activity.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getRegistrationCount(activity.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/activities/${activity.id}`}
                        className="text-primary hover:text-blue-600"
                      >
                        Chỉnh sửa
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex justify-center">
        <Button variant="link" asChild>
          <Link to="/activities">Xem tất cả hoạt động</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
