import { 
  Award, 
  CalendarCheck, 
  Clock, 
  TrendingUp 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

type StatsCardsProps = {
  currentPoints: number;
  completedActivities: number;
  pendingActivities: number;
  rank: string;
};

export function StatsCards({ 
  currentPoints, 
  completedActivities, 
  pendingActivities, 
  rank 
}: StatsCardsProps) {
  const stats = [
    {
      title: "Điểm rèn luyện",
      value: currentPoints,
      icon: <Award className="h-5 w-5 text-white" />,
      color: "bg-blue-500",
      href: "/points",
    },
    {
      title: "Hoạt động đã tham gia",
      value: completedActivities,
      icon: <CalendarCheck className="h-5 w-5 text-white" />,
      color: "bg-green-500",
      href: "/activities?status=completed",
    },
    {
      title: "Hoạt động đăng ký",
      value: pendingActivities,
      icon: <Clock className="h-5 w-5 text-white" />,
      color: "bg-yellow-500",
      href: "/activities?status=pending",
    },
    {
      title: "Xếp loại",
      value: rank,
      icon: <TrendingUp className="h-5 w-5 text-white" />,
      color: "bg-purple-500",
      href: "/points",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
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
                <Link to={stat.href} className="font-medium text-primary hover:text-blue-600">
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
