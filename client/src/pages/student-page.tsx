import { MainLayout } from "@/components/layout/main-layout";
import { StudentDashboard } from "@/components/student/dashboard";

export default function StudentPage() {
  return (
    <MainLayout>
      <StudentDashboard />
    </MainLayout>
  );
}
