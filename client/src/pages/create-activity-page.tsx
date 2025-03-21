import { MainLayout } from "@/components/layout/main-layout";
import { ActivityForm } from "@/components/ui/activity-form";

export default function CreateActivityPage() {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tạo hoạt động mới</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Tạo một hoạt động mới để sinh viên đăng ký tham gia
        </p>
      </div>

      <ActivityForm />
    </MainLayout>
  );
}
