import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertActivitySchema, Activity } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Extend the schema with client-side validation
const activityFormSchema = insertActivitySchema
  .extend({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    points: z.coerce.number().min(1, "Points must be at least 1"),
    maxParticipants: z.coerce.number().min(1, "Max participants must be at least 1").optional(),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

type ActivityFormValues = z.infer<typeof activityFormSchema>;

type ActivityFormProps = {
  defaultValues?: Partial<ActivityFormValues>;
  activity?: Activity;
  isEditing?: boolean;
};

export function ActivityForm({ defaultValues, activity, isEditing = false }: ActivityFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // If we're editing, combine the existing activity with any passed defaultValues
  const combinedDefaultValues = isEditing && activity
    ? { 
        ...activity, 
        // Convert dates to the format expected by input[type="datetime-local"]
        startDate: new Date(activity.startDate).toISOString().slice(0, 16),
        endDate: new Date(activity.endDate).toISOString().slice(0, 16),
        ...defaultValues
      }
    : {
        title: "",
        description: "",
        location: "",
        startDate: "",
        endDate: "",
        points: 5,
        maxParticipants: undefined,
        status: "draft",
        createdById: user?.id || 0,
        ...defaultValues
      };

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: combinedDefaultValues,
  });

  const createActivityMutation = useMutation({
    mutationFn: async (data: ActivityFormValues) => {
      const res = await apiRequest("POST", "/api/activities", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Activity created",
        description: "Your activity has been created successfully.",
      });
      setLocation("/activities");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create activity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: async (data: ActivityFormValues) => {
      if (!activity) throw new Error("Activity not found");
      const res = await apiRequest("PUT", `/api/activities/${activity.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Activity updated",
        description: "Your activity has been updated successfully.",
      });
      setLocation("/activities");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update activity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: ActivityFormValues) {
    if (isEditing) {
      updateActivityMutation.mutate(data);
    } else {
      createActivityMutation.mutate(data);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Chỉnh sửa hoạt động" : "Tạo hoạt động mới"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên hoạt động" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mô tả chi tiết về hoạt động" 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa điểm</FormLabel>
                  <FormControl>
                    <Input placeholder="Địa điểm tổ chức hoạt động" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian bắt đầu</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian kết thúc</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Điểm rèn luyện</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormDescription>
                      Số điểm rèn luyện sinh viên nhận được khi hoàn thành hoạt động
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Số lượng tối đa</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Không giới hạn"
                        value={value === undefined ? "" : value}
                        onChange={(e) => {
                          const val = e.target.value;
                          onChange(val === "" ? undefined : parseInt(val, 10));
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Để trống nếu không giới hạn số lượng người tham gia
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái hoạt động" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Bản nháp</SelectItem>
                      <SelectItem value="open">Mở đăng ký</SelectItem>
                      <SelectItem value="closed">Đóng đăng ký</SelectItem>
                      <SelectItem value="completed">Đã kết thúc</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Sinh viên chỉ có thể đăng ký khi hoạt động ở trạng thái "Mở đăng ký"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={createActivityMutation.isPending || updateActivityMutation.isPending}
            >
              {(createActivityMutation.isPending || updateActivityMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Cập nhật hoạt động" : "Tạo hoạt động"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
