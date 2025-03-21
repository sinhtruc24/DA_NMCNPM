import type { 
  User, InsertUser, 
  Activity, InsertActivity,
  Registration, InsertRegistration,
  Complaint, InsertComplaint,
  Notification, InsertNotification
} from "@shared/schema";
import type * as session from "express-session";

// Define the storage interface
export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Activity management
  getActivities(filters?: Partial<Activity>): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<Activity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;
  
  // Registration management
  getRegistrations(filters?: Partial<Registration>): Promise<Registration[]>;
  getRegistration(id: number): Promise<Registration | undefined>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistration(id: number, registration: Partial<Registration>): Promise<Registration | undefined>;
  deleteRegistration(id: number): Promise<boolean>;
  
  // Complaint management
  getComplaints(filters?: Partial<Complaint>): Promise<Complaint[]>;
  getComplaint(id: number): Promise<Complaint | undefined>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  updateComplaint(id: number, complaint: Partial<Complaint>): Promise<Complaint | undefined>;
  
  // Notification management
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
}

// Import the DatabaseStorage implementation after defining the interface
import { DatabaseStorage } from "./DatabaseStorage";

// Use PostgreSQL storage implementation
export const storage = new DatabaseStorage();
