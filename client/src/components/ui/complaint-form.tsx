import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertComplaintSchema, Activity } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Extend the schema with client-side validation
const complaintFormSchema = insertComplaintSchema
  .extend({
    description: z.string().min(10, "Please provide a more detailed complaint description"),
  });

type ComplaintFormValues = z.infer<typeof complaintFormSchema>;

type ComplaintFormProps = {
  defaultValues?: Partial<ComplaintFormValues>;
  onSuccess?: () => void;
};

export function ComplaintForm({ defaultValues, onSuccess }: ComplaintFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  // Get completed activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  // Get user's registrations (to filter activities the user has registered for)
  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ["/api/registrations"],
  });

  // Filter activities to show only those the user has registered for
  const eligibleActivities = activities?.filter(activity => 
    registrations?.some(reg => 
      reg.activityId === activity.id && 
      reg.userId === user?.id
    )
  );

  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      userId: user?.id || 0,
      description: "",
      ...defaultValues
    },
  });

  const createComplaintMutation = useMutation({
    mutationFn: async (data: ComplaintFormValues) => {
      const res = await apiRequest("POST", "/api/complaints", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      toast({
        title: "Complaint submitted",
        description: "Your complaint has been submitted successfully.",
      });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit complaint",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: ComplaintFormValues) {
    createComplaintMutation.mutate(data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gửi khiếu nại</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="activityId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hoạt động</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    value={field.value?.toString()}
                    disabled={activitiesLoading || registrationsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn hoạt động cần khiếu nại" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activitiesLoading || registrationsLoading ? (
                        <SelectItem value="loading" disabled>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Đang tải...
                        </SelectItem>
                      ) : eligibleActivities?.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Bạn chưa đăng ký hoạt động nào
                        </SelectItem>
                      ) : (
                        eligibleActivities?.map((activity) => (
                          <SelectItem key={activity.id} value={activity.id.toString()}>
                            {activity.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Chọn hoạt động mà bạn muốn gửi khiếu nại
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung khiếu nại</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mô tả chi tiết vấn đề bạn gặp phải" 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Vui lòng cung cấp đầy đủ thông tin để chúng tôi có thể xử lý khiếu nại của bạn
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={createComplaintMutation.isPending}
            >
              {createComplaintMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Gửi khiếu nại
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
