import { Activity, Registration } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addDays, format, getDay, isSameDay, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from "date-fns";
import { vi } from "date-fns/locale";

type CalendarProps = {
  activities: Activity[];
  registrations: Registration[];
};

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  hasPendingActivity: boolean;
  hasApprovedActivity: boolean;
  isToday: boolean;
};

export function Calendar({ activities, registrations }: CalendarProps) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const startDate = subDays(monthStart, getDay(monthStart));
  const endDate = addDays(monthEnd, 6 - getDay(monthEnd));

  const days = eachDayOfInterval({ start: startDate, end: endDate }).map(date => {
    // Find activities for this day
    const dayActivities = activities.filter(activity => 
      isSameDay(new Date(activity.startDate), date)
    );
    
    // Get registrations for those activities
    const dayRegistrations = dayActivities.map(activity => {
      return registrations.find(reg => reg.activityId === activity.id);
    }).filter(Boolean) as Registration[];
    
    // Check activity status
    const hasPendingActivity = dayRegistrations.some(reg => reg.status === "pending");
    const hasApprovedActivity = dayRegistrations.some(reg => reg.status === "approved");
    
    return {
      date,
      isCurrentMonth: isSameMonth(date, today),
      hasPendingActivity,
      hasApprovedActivity,
      isToday: isSameDay(date, today)
    };
  });

  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const getDayClassName = (day: CalendarDay) => {
    let className = "calendar-day text-center py-1 text-sm ";
    
    if (day.isToday) {
      return className + "rounded-full bg-yellow-100 dark:bg-yellow-900";
    }
    
    if (day.hasApprovedActivity) {
      return className + "rounded-full bg-green-100 dark:bg-green-900";
    }
    
    if (day.hasPendingActivity) {
      return className + "rounded-full bg-blue-100 dark:bg-blue-900";
    }
    
    return className;
  };

  const getDayTextClassName = (day: CalendarDay) => {
    if (!day.isCurrentMonth) {
      return "text-gray-400";
    }
    
    if (day.isToday) {
      return "text-yellow-600 dark:text-yellow-200 font-medium";
    }
    
    if (day.hasApprovedActivity) {
      return "text-green-600 dark:text-green-200 font-medium";
    }
    
    if (day.hasPendingActivity) {
      return "text-blue-600 dark:text-blue-200 font-medium";
    }
    
    return "text-gray-900 dark:text-gray-200";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
          Lịch hoạt động
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {format(today, "MMMM yyyy", { locale: vi })}
        </p>
      </CardHeader>
      <CardContent>
        {/* Calendar header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
          {daysOfWeek.map((day, index) => (
            <div key={index}>{day}</div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="mt-2 grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div key={index} className={getDayClassName(day)}>
              <span className={getDayTextClassName(day)}>
                {format(day.date, "d")}
              </span>
            </div>
          ))}
        </div>
        
        {/* Calendar legend */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-xs">
            <span className="h-3 w-3 rounded-full bg-blue-100 dark:bg-blue-900"></span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Hoạt động đã đăng ký</span>
          </div>
          <div className="flex items-center text-xs">
            <span className="h-3 w-3 rounded-full bg-green-100 dark:bg-green-900"></span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Hoạt động đã duyệt</span>
          </div>
          <div className="flex items-center text-xs">
            <span className="h-3 w-3 rounded-full bg-yellow-100 dark:bg-yellow-900"></span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Hoạt động hôm nay</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
