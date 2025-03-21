import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Activity, Complaint } from "@shared/schema";
import { ComplaintForm } from "@/components/ui/complaint-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Triangle, MessageCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Response form schema
const responseSchema = z.object({
  response: z.string().min(5, "Phản hồi phải có ít nhất 5 ký tự"),
  status: z.enum(["resolved", "rejected"]),
});

type ResponseFormValues = z.infer<typeof responseSchema>;

export default function ComplaintsPage() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Get complaints
  const { data: complaints, isLoading: complaintsLoading } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
  });

  // Get activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  // Response form
  const responseForm = useForm<ResponseFormValues>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      response: "",
      status: "resolved",
    },
  });

  // Update complaint mutation
  const updateComplaintMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ResponseFormValues }) => {
      const res = await apiRequest("PUT", `/api/complaints/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      setSelectedComplaint(null);
    },
  });

  // Filter complaints based on tab
  const filteredComplaints = complaints
    ?.filter(complaint => {
      if (activeTab === "all") return true;
      return complaint.status === activeTab;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

  // Get activity title
  const getActivityTitle = (activityId: number) => {
    return activities?.find(a => a.id === activityId)?.title || "Hoạt động không xác định";
  };

  // Handle responding to a complaint
  const handleRespondToComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
  };

  // Handle form submission
  const onSubmitResponse = (data: ResponseFormValues) => {
    if (!selectedComplaint) return;
    updateComplaintMutation.mutate({
      id: selectedComplaint.id,
      data,
    });
  };

  const isLoading = complaintsLoading || activitiesLoading;

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user?.role === "student" ? "Khiếu nại" : "Quản lý khiếu nại"}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {user?.role === "student" 
              ? "Gửi và theo dõi các khiếu nại về điểm rèn luyện" 
              : "Xem và phản hồi các khiếu nại từ sinh viên"}
          </p>
        </div>
        {user?.role === "student" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Gửi khiếu nại mới
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Gửi khiếu nại mới</DialogTitle>
              </DialogHeader>
              <ComplaintForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="pending">Đang chờ xử lý</TabsTrigger>
          <TabsTrigger value="resolved">Đã xử lý</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                {activeTab === "all" && "Tất cả khiếu nại"}
                {activeTab === "pending" && "Khiếu nại đang chờ xử lý"}
                {activeTab === "resolved" && "Khiếu nại đã xử lý"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="text-center py-8">
                  <Triangle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Không có khiếu nại</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    {user?.role === "student" 
                      ? "Bạn chưa gửi khiếu nại nào." 
                      : "Không có khiếu nại nào từ sinh viên."}
                  </p>
                  {user?.role === "student" && (
                    <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Gửi khiếu nại mới
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredComplaints.map((complaint) => (
                    <div 
                      key={complaint.id} 
                      className={`p-6 rounded-lg border ${
                        complaint.status === "pending"
                          ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800"
                          : complaint.status === "resolved"
                          ? "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800"
                      }`}
                    >
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-md font-medium text-gray-900 dark:text-white">
                            {getActivityTitle(complaint.activityId)}
                          </h3>
                          <Badge className={
                            complaint.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : complaint.status === "resolved"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }>
                            {complaint.status === "pending" 
                              ? "Đang chờ xử lý" 
                              : complaint.status === "resolved" 
                              ? "Đã giải quyết"
                              : "Đã từ chối"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Ngày gửi: {format(new Date(complaint.createdAt), "dd/MM/yyyy")}
                        </div>
                        <div className="text-gray-700 dark:text-gray-300">
                          <div className="flex items-start space-x-2">
                            <Triangle className="h-5 w-5 mt-0.5 text-red-500" />
                            <div>
                              <div className="font-medium">Nội dung khiếu nại:</div>
                              <p>{complaint.description}</p>
                            </div>
                          </div>
                        </div>
                        
                        {complaint.response && (
                          <div className="text-gray-700 dark:text-gray-300 mt-4">
                            <div className="flex items-start space-x-2">
                              <MessageCircle className="h-5 w-5 mt-0.5 text-green-500" />
                              <div>
                                <div className="font-medium">Phản hồi:</div>
                                <p>{complaint.response}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {user?.role === "org" && complaint.status === "pending" && (
                          <div className="flex justify-end mt-4">
                            <Button onClick={() => handleRespondToComplaint(complaint)}>
                              Phản hồi
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      {selectedComplaint && (
        <Dialog open={!!selectedComplaint} onOpenChange={(open) => !open && setSelectedComplaint(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Phản hồi khiếu nại</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Nội dung khiếu nại:</h3>
              <p className="mt-2 text-gray-700 dark:text-gray-300">{selectedComplaint.description}</p>
            </div>
            <form onSubmit={responseForm.handleSubmit(onSubmitResponse)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Phản hồi của bạn
                </label>
                <Textarea
                  placeholder="Nhập phản hồi của bạn..."
                  {...responseForm.register("response")}
                  className="min-h-32"
                />
                {responseForm.formState.errors.response && (
                  <p className="text-sm text-red-500">{responseForm.formState.errors.response.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Trạng thái
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="resolved"
                      {...responseForm.register("status")}
                      defaultChecked
                      className="h-4 w-4 text-primary"
                    />
                    <span>Chấp nhận</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="rejected"
                      {...responseForm.register("status")}
                      className="h-4 w-4 text-primary"
                    />
                    <span>Từ chối</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <Button variant="outline" type="button" onClick={() => setSelectedComplaint(null)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={updateComplaintMutation.isPending}>
                  {updateComplaintMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý
                    </>
                  ) : "Gửi phản hồi"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
}
