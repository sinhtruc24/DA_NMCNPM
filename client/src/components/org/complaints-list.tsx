import { Complaint } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

type ComplaintsListProps = {
  complaints: Complaint[];
};

export function ComplaintsList({ complaints }: ComplaintsListProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
          Khiếu nại gần đây
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Khiếu nại của sinh viên về điểm rèn luyện
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {complaints.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
            Không có khiếu nại nào cần xử lý
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {complaints.map((complaint) => (
              <li key={complaint.id} className="px-6 py-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {getUserName(complaint.userId)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(complaint.createdAt), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {complaint.description}
                  </p>
                  <div className="flex justify-end">
                    <Button 
                      variant="link" 
                      size="sm" 
                      asChild 
                      className="text-xs font-medium text-primary hover:text-blue-600"
                    >
                      <Link to={`/complaints/${complaint.id}`}>Phản hồi</Link>
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
          <Link to="/complaints">Xem tất cả</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
