import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useQuery } from "@tanstack/react-query";
import { Activity, Registration } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, Link, useSearch } from "wouter";
import { ActivityTable } from "@/components/org/activity-table";
import { useAuth } from "@/hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Plus, Search, Filter, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivitiesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const showPendingApprovals = search.includes("pendingApprovals=true");
  const statusParam = search.includes("status=") ? search.split("status=")[1].split("&")[0] : null;
  
  // Get activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  // Get registrations
  const { data: registrations, isLoading: registrationsLoading } = useQuery<Registration[]>({
    queryKey: ["/api/registrations"],
  });

  // Register for activity mutation
  const registerMutation = useMutation({
    mutationFn: async (activityId: number) => {
      const res = await apiRequest("POST", "/api/registrations", { activityId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
      toast({
        title: "Đăng ký thành công",
        description: "Bạn đã đăng ký tham gia hoạt động này thành công.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng ký thất bại",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter activities based on role and filters
  const filteredActivities = activities
    ?.filter(activity => {
      // Text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          activity.title.toLowerCase().includes(query) ||
          activity.description.toLowerCase().includes(query) ||
          activity.location.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter(activity => {
      // Status filter
      if (statusFilter !== "all") {
        return activity.status === statusFilter;
      }
      // URL filter from query param
      if (statusParam) {
        return activity.status === statusParam;
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by start date, newest first
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }) || [];

  // Filter pending approvals if needed
  const pendingApprovalActivities = showPendingApprovals && user?.role === "org" && activities && registrations
    ? activities.filter(activity => 
        registrations.some(reg => 
          reg.activityId === activity.id && 
          reg.status === "pending"
        )
      )
    : [];

  const hasRegistered = (activityId: number) => {
    return registrations?.some(reg => reg.activityId === activityId && reg.userId === user?.id);
  };

  const getRegistrationStatus = (activityId: number) => {
    const registration = registrations?.find(
      reg => reg.activityId === activityId && reg.userId === user?.id
    );
    return registration?.status || null;
  };

  const handleRegister = (activityId: number) => {
    registerMutation.mutate(activityId);
  };

  const isLoading = activitiesLoading || registrationsLoading;

  if (user?.role === "org" && !showPendingApprovals) {
    return (
      <MainLayout>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý hoạt động</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Quản lý và theo dõi các hoạt động của bạn
            </p>
          </div>
          <Button asChild>
            <Link to="/create-activity">
              <Plus className="mr-2 h-4 w-4" />
              Tạo hoạt động mới
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm hoạt động..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="draft">Bản nháp</SelectItem>
              <SelectItem value="open">Đang mở đăng ký</SelectItem>
              <SelectItem value="closed">Đã đóng đăng ký</SelectItem>
              <SelectItem value="completed">Đã kết thúc</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <ActivityTable activities={filteredActivities} />
        )}
      </MainLayout>
    );
  }

  if (user?.role === "org" && showPendingApprovals) {
    return (
      <MainLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Phê duyệt đăng ký</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Xem và phê duyệt sinh viên đăng ký tham gia hoạt động
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : pendingApprovalActivities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mb-4">
                <Check className="h-6 w-6 text-blue-600 dark:text-blue-200" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Không có yêu cầu phê duyệt</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-center max-w-md">
                Hiện tại không có sinh viên nào đang chờ phê duyệt đăng ký tham gia hoạt động của bạn.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ActivityTable activities={pendingApprovalActivities} />
        )}
      </MainLayout>
    );
  }

  // Student view
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Danh sách hoạt động</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Xem và đăng ký tham gia các hoạt động rèn luyện
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm hoạt động..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="open">Đang mở đăng ký</SelectItem>
            <SelectItem value="closed">Đã đóng đăng ký</SelectItem>
            <SelectItem value="completed">Đã kết thúc</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mb-4">
              <Filter className="h-6 w-6 text-blue-600 dark:text-blue-200" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Không tìm thấy hoạt động</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-center max-w-md">
              Không có hoạt động nào phù hợp với bộ lọc hiện tại. Vui lòng thử lại với các tiêu chí khác.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}>
              Xóa bộ lọc
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredActivities.map((activity) => {
            const registrationStatus = getRegistrationStatus(activity.id);
            
            return (
              <Card key={activity.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </CardTitle>
                    {activity.status === "open" && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Đang mở đăng ký
                      </Badge>
                    )}
                    {activity.status === "closed" && (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Đã đóng đăng ký
                      </Badge>
                    )}
                    {activity.status === "completed" && (
                      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        Đã kết thúc
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3 my-3">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>{format(new Date(activity.startDate), "dd/MM/yyyy")}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>
                        {format(new Date(activity.startDate), "HH:mm")} - 
                        {format(new Date(activity.endDate), "HH:mm")}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Award className="mr-1 h-4 w-4" />
                      <span>{activity.points} điểm</span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <MapPin className="mr-1 h-4 w-4" />
                    <span>{activity.location}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                    {activity.description}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    {!registrationStatus && activity.status === "open" ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button>Đăng ký tham gia</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận đăng ký</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn đăng ký tham gia hoạt động này? Bạn cần tham gia đầy đủ để được tính điểm rèn luyện.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleRegister(activity.id)}
                              disabled={registerMutation.isPending}
                            >
                              {registerMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Badge className={
                        registrationStatus === "approved" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                          : registrationStatus === "pending" 
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : registrationStatus === "rejected"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : registrationStatus === "completed"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }>
                        {registrationStatus === "approved" 
                          ? "Đã duyệt" 
                          : registrationStatus === "pending" 
                          ? "Chờ duyệt"
                          : registrationStatus === "rejected"
                          ? "Bị từ chối"
                          : registrationStatus === "completed"
                          ? "Đã hoàn thành"
                          : "Đã kết thúc"}
                      </Badge>
                    )}
                    <Button variant="ghost" asChild>
                      <Link to={`/activities/${activity.id}`}>Xem chi tiết</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
}

function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
