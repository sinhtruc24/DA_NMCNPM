import { Activity, Registration } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format } from "date-fns";

type ActivityListProps = {
  activities: Activity[];
  registrations: Registration[];
};

export function ActivityList({ activities, registrations }: ActivityListProps) {
  const getRegistrationStatus = (activityId: number): string => {
    const registration = registrations.find(r => r.activityId === activityId);
    return registration ? registration.status : "not-registered";
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      case "completed":
        return "Đã hoàn thành";
      default:
        return "Chưa đăng ký";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
          Hoạt động sắp tới
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">Các hoạt động bạn đã đăng ký</p>
      </CardHeader>
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Bạn chưa đăng ký hoạt động nào</p>
            <Button asChild className="mt-4">
              <Link to="/activities">Xem tất cả hoạt động</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {activities.map((activity) => {
              const status = getRegistrationStatus(activity.id);
              return (
                <li key={activity.id}>
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {activity.title}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-4">
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Calendar className="mr-1 h-3 w-3" />
                              <span>{format(new Date(activity.startDate), "dd/MM/yyyy")}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="mr-1 h-3 w-3" />
                              <span>
                                {format(new Date(activity.startDate), "HH:mm")} - 
                                {format(new Date(activity.endDate), "HH:mm")}
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <MapPin className="mr-1 h-3 w-3" />
                              <span>{activity.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusBadgeColor(status)}>
                        {getStatusText(status)}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Điểm rèn luyện: {activity.points}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex justify-center">
        <Button variant="link" asChild>
          <Link to="/activities">Xem tất cả hoạt động</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
