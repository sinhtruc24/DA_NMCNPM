import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  BarChart3,
  Calendar,
  User,
  LogOut,
  Settings,
  AlertTriangle,
  Bell,
  Home,
  Award,
  UserCheck,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const studentNavItems = [
    {
      title: "Dashboard",
      href: "/student",
      icon: <Home className="h-5 w-5 mr-3" />,
    },
    {
      title: "Hoạt động",
      href: "/activities",
      icon: <Calendar className="h-5 w-5 mr-3" />,
    },
    {
      title: "Điểm rèn luyện",
      href: "/points",
      icon: <Award className="h-5 w-5 mr-3" />,
    },
    {
      title: "Thông báo",
      href: "/notifications",
      icon: <Bell className="h-5 w-5 mr-3" />,
    },
    {
      title: "Khiếu nại",
      href: "/complaints",
      icon: <AlertTriangle className="h-5 w-5 mr-3" />,
    },
    {
      title: "Cài đặt",
      href: "/settings",
      icon: <Settings className="h-5 w-5 mr-3" />,
    },
  ];

  const orgNavItems = [
    {
      title: "Dashboard",
      href: "/org",
      icon: <Home className="h-5 w-5 mr-3" />,
    },
    {
      title: "Quản lý hoạt động",
      href: "/activities",
      icon: <Calendar className="h-5 w-5 mr-3" />,
    },
    {
      title: "Tạo hoạt động mới",
      href: "/create-activity",
      icon: <Plus className="h-5 w-5 mr-3" />,
    },
    {
      title: "Phê duyệt đăng ký",
      href: "/activities?pendingApprovals=true",
      icon: <UserCheck className="h-5 w-5 mr-3" />,
    },
    {
      title: "Điểm rèn luyện",
      href: "/points",
      icon: <BarChart3 className="h-5 w-5 mr-3" />,
    },
    {
      title: "Thông báo",
      href: "/notifications",
      icon: <Bell className="h-5 w-5 mr-3" />,
    },
    {
      title: "Khiếu nại",
      href: "/complaints",
      icon: <AlertTriangle className="h-5 w-5 mr-3" />,
    },
    {
      title: "Cài đặt",
      href: "/settings",
      icon: <Settings className="h-5 w-5 mr-3" />,
    },
  ];

  const navItems = user?.role === "student" ? studentNavItems : orgNavItems;

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link to={user?.role === "student" ? "/student" : "/org"} className="text-primary font-bold text-xl">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
              </svg>
              ActiHub
            </span>
          </Link>
        </div>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href || 
                              (item.href !== "/student" && 
                               item.href !== "/org" && 
                               location.startsWith(item.href));
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={mobile ? onClose : undefined}
                >
                  <span 
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive 
                        ? "bg-primary text-white" 
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700">
                  <User className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300" title={user?.fullName}>
                    {user?.fullName?.length > 15 
                      ? `${user.fullName.substring(0, 15)}...` 
                      : user?.fullName}
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400" title={user?.role === "student" ? "Sinh viên" : "Đơn vị tổ chức"}>
                    {user?.role === "student" ? "Sinh viên" : "Đơn vị tổ chức"}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2" 
                onClick={handleLogout}
                title="Đăng xuất"
              >
                <LogOut className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
