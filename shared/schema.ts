import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - shared for both students and organization admins
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("student"), // "student" or "org"
  studentId: text("student_id"),  // Only for students
  orgName: text("org_name"),      // Only for organizations
});

// Activities table - for events/activities created by organizations
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  points: integer("points").notNull(),
  maxParticipants: integer("max_participants"),
  status: text("status").notNull().default("draft"), // draft, open, closed, completed
  createdById: integer("created_by_id").notNull(), // Reference to organization user
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Registrations table - tracks student registrations for activities
export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Student who registered
  activityId: integer("activity_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  pointsAwarded: integer("points_awarded"),
});

// Complaints table - for student appeals/complaints
export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Student who filed the complaint
  activityId: integer("activity_id").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"), // pending, resolved, rejected
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Notifications table - for system notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // User to be notified
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  type: text("type").notNull(), // activity, registration, complaint, system
  referenceId: integer("reference_id"), // ID of the related entity (activity, registration, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for insert operations
export const insertUserSchema = createInsertSchema(users).omit({
  id: true
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  pointsAwarded: true
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  response: true
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});

// Types for TypeScript usage
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;

export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
