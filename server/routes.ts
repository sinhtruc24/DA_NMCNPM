import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireRole } from "./auth";
import { 
  insertActivitySchema, 
  insertRegistrationSchema, 
  insertComplaintSchema,
  insertNotificationSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Activities routes
  app.get("/api/activities", async (req, res, next) => {
    try {
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/activities/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.getActivity(id);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.json(activity);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/activities", requireAuth, requireRole("org"), async (req, res, next) => {
    try {
      const validatedData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/activities/:id", requireAuth, requireRole("org"), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.getActivity(id);
      
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Check if the logged-in organization is the creator of the activity
      if (activity.createdById !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized: You can only update your own activities" });
      }
      
      const validatedData = insertActivitySchema.partial().parse(req.body);
      const updatedActivity = await storage.updateActivity(id, validatedData);
      res.json(updatedActivity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      next(error);
    }
  });

  app.delete("/api/activities/:id", requireAuth, requireRole("org"), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.getActivity(id);
      
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Check if the logged-in organization is the creator of the activity
      if (activity.createdById !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized: You can only delete your own activities" });
      }
      
      const success = await storage.deleteActivity(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete activity" });
      }
    } catch (error) {
      next(error);
    }
  });

  // Registration routes
  app.get("/api/registrations", requireAuth, async (req, res, next) => {
    try {
      let registrations;
      if (req.user.role === "student") {
        // Students can only see their own registrations
        registrations = await storage.getRegistrations({ userId: req.user.id });
      } else {
        // Organizations can filter by activityId
        const activityId = req.query.activityId ? parseInt(req.query.activityId as string) : undefined;
        if (activityId) {
          // Check if the activity belongs to the organization
          const activity = await storage.getActivity(activityId);
          if (!activity || activity.createdById !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized: You can only view registrations for your own activities" });
          }
          registrations = await storage.getRegistrations({ activityId });
        } else {
          // Get all registrations for the organization's activities
          const activities = await storage.getActivities({ createdById: req.user.id });
          const activityIds = activities.map(a => a.id);
          if (activityIds.length === 0) {
            registrations = [];
          } else {
            registrations = (await Promise.all(
              activityIds.map(id => storage.getRegistrations({ activityId: id }))
            )).flat();
          }
        }
      }
      res.json(registrations);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/registrations", requireAuth, requireRole("student"), async (req, res, next) => {
    try {
      const validatedData = insertRegistrationSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Check if the activity exists
      const activity = await storage.getActivity(validatedData.activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Check if registration already exists
      const existingRegistrations = await storage.getRegistrations({
        userId: req.user.id,
        activityId: validatedData.activityId
      });
      
      if (existingRegistrations.length > 0) {
        return res.status(400).json({ message: "You have already registered for this activity" });
      }
      
      // Check if the activity is open for registration
      if (activity.status !== "open") {
        return res.status(400).json({ message: "This activity is not open for registration" });
      }
      
      // Check if the activity is full
      if (activity.maxParticipants) {
        const currentRegistrations = await storage.getRegistrations({
          activityId: validatedData.activityId
        });
        if (currentRegistrations.length >= activity.maxParticipants) {
          return res.status(400).json({ message: "This activity is already full" });
        }
      }
      
      const registration = await storage.createRegistration(validatedData);
      
      // Create notification for organization
      await storage.createNotification({
        userId: activity.createdById,
        title: "New Registration",
        message: `A student has registered for "${activity.title}"`,
        type: "registration",
        referenceId: registration.id,
        isRead: false
      });
      
      res.status(201).json(registration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/registrations/:id", requireAuth, requireRole("org"), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const registration = await storage.getRegistration(id);
      
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      // Check if the activity belongs to the organization
      const activity = await storage.getActivity(registration.activityId);
      if (!activity || activity.createdById !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized: You can only update registrations for your own activities" });
      }
      
      const validatedData = z.object({
        status: z.enum(["pending", "approved", "rejected", "completed"]),
        pointsAwarded: z.number().optional()
      }).parse(req.body);
      
      const updatedRegistration = await storage.updateRegistration(id, validatedData);
      
      // Create notification for student
      const student = await storage.getUser(registration.userId);
      if (student) {
        let message = "";
        if (validatedData.status === "approved") {
          message = `Your registration for "${activity.title}" has been approved`;
        } else if (validatedData.status === "rejected") {
          message = `Your registration for "${activity.title}" has been rejected`;
        } else if (validatedData.status === "completed") {
          message = `You have been awarded ${validatedData.pointsAwarded || activity.points} points for "${activity.title}"`;
        }
        
        if (message) {
          await storage.createNotification({
            userId: registration.userId,
            title: "Registration Update",
            message,
            type: "registration",
            referenceId: registration.id,
            isRead: false
          });
        }
      }
      
      res.json(updatedRegistration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      next(error);
    }
  });

  // Complaint routes
  app.get("/api/complaints", requireAuth, async (req, res, next) => {
    try {
      let complaints;
      if (req.user.role === "student") {
        // Students can only see their own complaints
        complaints = await storage.getComplaints({ userId: req.user.id });
      } else {
        // Organizations can see complaints for their activities
        const activities = await storage.getActivities({ createdById: req.user.id });
        const activityIds = activities.map(a => a.id);
        if (activityIds.length === 0) {
          complaints = [];
        } else {
          complaints = (await Promise.all(
            activityIds.map(id => storage.getComplaints({ activityId: id }))
          )).flat();
        }
      }
      res.json(complaints);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/complaints", requireAuth, requireRole("student"), async (req, res, next) => {
    try {
      const validatedData = insertComplaintSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Check if the activity exists
      const activity = await storage.getActivity(validatedData.activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      const complaint = await storage.createComplaint(validatedData);
      
      // Create notification for organization
      await storage.createNotification({
        userId: activity.createdById,
        title: "New Complaint",
        message: `A student has filed a complaint about "${activity.title}"`,
        type: "complaint",
        referenceId: complaint.id,
        isRead: false
      });
      
      res.status(201).json(complaint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/complaints/:id", requireAuth, requireRole("org"), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const complaint = await storage.getComplaint(id);
      
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      
      // Check if the complaint is for an activity that belongs to the organization
      const activity = await storage.getActivity(complaint.activityId);
      if (!activity || activity.createdById !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized: You can only respond to complaints for your own activities" });
      }
      
      const validatedData = z.object({
        status: z.enum(["pending", "resolved", "rejected"]),
        response: z.string().min(1)
      }).parse(req.body);
      
      const updatedComplaint = await storage.updateComplaint(id, validatedData);
      
      // Create notification for student
      await storage.createNotification({
        userId: complaint.userId,
        title: "Complaint Response",
        message: `Your complaint about "${activity.title}" has been ${validatedData.status}`,
        type: "complaint",
        referenceId: complaint.id,
        isRead: false
      });
      
      res.json(updatedComplaint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      next(error);
    }
  });

  // Notification routes
  app.get("/api/notifications", requireAuth, async (req, res, next) => {
    try {
      const notifications = await storage.getNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/notifications/:id/read", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      next(error);
    }
  });

  // Points summary endpoint (for students)
  app.get("/api/points/summary", requireAuth, requireRole("student"), async (req, res, next) => {
    try {
      const completedRegistrations = await storage.getRegistrations({
        userId: req.user.id,
        status: "completed"
      });
      
      let totalPoints = 0;
      let monthlyPoints: {[key: string]: number} = {};
      
      completedRegistrations.forEach(reg => {
        if (reg.pointsAwarded) {
          totalPoints += reg.pointsAwarded;
          
          // Calculate monthly points
          if (reg.updatedAt) {
            const monthYear = new Date(reg.updatedAt).toISOString().substring(0, 7); // YYYY-MM format
            monthlyPoints[monthYear] = (monthlyPoints[monthYear] || 0) + reg.pointsAwarded;
          }
        }
      });
      
      // Convert monthly points to array for easier frontend processing
      const monthlyPointsArray = Object.entries(monthlyPoints).map(([month, points]) => ({
        month,
        points
      })).sort((a, b) => a.month.localeCompare(b.month));
      
      // Calculate rank based on total points
      let rank = "Yếu";
      if (totalPoints >= 90) rank = "Xuất sắc";
      else if (totalPoints >= 80) rank = "Tốt";
      else if (totalPoints >= 65) rank = "Khá";
      else if (totalPoints >= 50) rank = "Trung bình";
      
      res.json({
        totalPoints,
        rank,
        monthlyPoints: monthlyPointsArray,
        completedActivities: completedRegistrations.length
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
