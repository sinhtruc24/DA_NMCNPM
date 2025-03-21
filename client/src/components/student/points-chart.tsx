import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

type MonthlyPoints = {
  month: string; // YYYY-MM format
  points: number;
};

type PointsChartProps = {
  monthlyPoints: MonthlyPoints[];
};

export function PointsChart({ monthlyPoints }: PointsChartProps) {
  // Format the month from YYYY-MM to textual representation
  const formatMonth = (month: string) => {
    const date = parseISO(`${month}-01`);
    return format(date, "MMM", { locale: vi });
  };

  // Find the maximum points to scale the bars
  const maxPoints = Math.max(...monthlyPoints.map(m => m.points), 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
          Lịch sử điểm rèn luyện
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sự thay đổi điểm rèn luyện theo thời gian
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end space-x-2">
          {monthlyPoints.length === 0 ? (
            <div className="w-full flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">Chưa có dữ liệu điểm rèn luyện</p>
            </div>
          ) : (
            monthlyPoints.map((point, index) => (
              <div 
                key={index}
                className="chart-bar bg-blue-500 dark:bg-blue-600 w-8 rounded-t-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-300" 
                style={{ 
                  height: maxPoints ? `${(point.points / maxPoints) * 100}%` : "0%",
                  minHeight: "4px"
                }}
                title={`${formatMonth(point.month)}: ${point.points} điểm`}
              ></div>
            ))
          )}
        </div>
        <div className="mt-4 grid" style={{ gridTemplateColumns: `repeat(${monthlyPoints.length}, 1fr)` }}>
          {monthlyPoints.map((point, index) => (
            <div key={index} className="text-center text-xs text-gray-500 dark:text-gray-400">
              {formatMonth(point.month)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
