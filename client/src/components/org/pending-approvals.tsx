import { Registration } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { User, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type PendingApprovalsProps = {
  registrations: Registration[];
};

export function PendingApprovals({ registrations }: PendingApprovalsProps) {
  const { toast } = useToast();

  // Get users data
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  // Get activities data
  const { data: activities } = useQuery({
    queryKey: ["/api/activities"],
  });

  // Get user name
  const getUserName = (userId: number) => {
    const user = users?.find(u => u.id === userId);
    return user?.fullName || "Unknown User";
  };

  // Get activity name
  const getActivityName = (activityId: number) => {
    const activity = activities?.find(a => a.id === activityId);
    return activity?.title || "Unknown Activity";
  };

  // Handle approval
  const updateRegistrationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/registrations/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
      toast({
        title: "Success",
        description: "Registration status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: number) => {
    updateRegistrationMutation.mutate({ id, status: "approved" });
  };

  const handleReject = (id: number) => {
    updateRegistrationMutation.mutate({ id, status: "rejected" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
          Chờ phê duyệt
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sinh viên đăng ký tham gia hoạt động
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {registrations.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
            Không có đăng ký nào đang chờ phê duyệt
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {registrations.map((registration) => (
              <li key={registration.id} className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {getUserName(registration.userId)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      Hoạt động: {getActivityName(registration.activityId)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 border-0"
                      onClick={() => handleApprove(registration.id)}
                      disabled={updateRegistrationMutation.isPending}
                    >
                      <Check className="h-4 w-4" />
                      <span className="sr-only">Approve</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 border-0"
                      onClick={() => handleReject(registration.id)}
                      disabled={updateRegistrationMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Reject</span>
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700 px-6 py-3 text-center">
        <Button variant="link" asChild className="mx-auto">
          <Link to="/activities?pendingApprovals=true">Xem tất cả</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
