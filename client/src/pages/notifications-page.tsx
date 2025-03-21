import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Loader2,
  MessageCircle,
  RefreshCcw,
  Triangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");

  // Get notifications
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/notifications/${id}/read`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications?.filter(n => !n.isRead) || [];
      await Promise.all(
        unreadNotifications.map(notification => 
          apiRequest("PUT", `/api/notifications/${notification.id}/read`, {})
        )
      );
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Filter notifications based on tab
  const filteredNotifications = notifications
    ?.filter(notification => {
      if (activeTab === "all") return true;
      if (activeTab === "unread") return !notification.isRead;
      return notification.type === activeTab;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

  // Get unread count by type
  const getUnreadCount = (type: string | null = null) => {
    return notifications?.filter(n => 
      !n.isRead && (type === null || n.type === type)
    ).length || 0;
  };

  // Handle mark as read
  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "activity":
        return <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "registration":
        return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case "complaint":
        return <Triangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case "system":
        return <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thông báo</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Xem tất cả thông báo và cập nhật của bạn
          </p>
        </div>
        {getUnreadCount() > 0 && (
          <Button 
            variant="outline" 
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="all" className="relative">
            Tất cả
            {getUnreadCount() > 0 && (
              <Badge className="ml-2 bg-primary text-white">{getUnreadCount()}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread" className="relative">
            Chưa đọc
            {getUnreadCount() > 0 && (
              <Badge className="ml-2 bg-primary text-white">{getUnreadCount()}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity" className="relative">
            Hoạt động
            {getUnreadCount("activity") > 0 && (
              <Badge className="ml-2 bg-primary text-white">{getUnreadCount("activity")}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="registration" className="relative">
            Đăng ký
            {getUnreadCount("registration") > 0 && (
              <Badge className="ml-2 bg-primary text-white">{getUnreadCount("registration")}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="complaint" className="relative">
            Khiếu nại
            {getUnreadCount("complaint") > 0 && (
              <Badge className="ml-2 bg-primary text-white">{getUnreadCount("complaint")}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                {activeTab === "all" && "Tất cả thông báo"}
                {activeTab === "unread" && "Thông báo chưa đọc"}
                {activeTab === "activity" && "Thông báo về hoạt động"}
                {activeTab === "registration" && "Thông báo về đăng ký"}
                {activeTab === "complaint" && "Thông báo về khiếu nại"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Không có thông báo</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Không có thông báo nào trong mục này.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.isRead
                          ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          : "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 p-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {format(new Date(notification.createdAt), "dd/MM/yyyy HH:mm")}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="mt-3 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            {markAsReadMutation.isPending && notification.id === markAsReadMutation.variables ? (
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            ) : null}
                            Đánh dấu đã đọc
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
