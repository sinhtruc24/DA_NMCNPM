import { 
  User, InsertUser, 
  Activity, InsertActivity,
  Registration, InsertRegistration,
  Complaint, InsertComplaint,
  Notification, InsertNotification,
  users, activities, registrations, complaints, notifications
} from "@shared/schema";
import { db } from "./database";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { queryClient } from "./database";
import { IStorage } from "./storage";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL || 
          `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`,
      },
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Activity methods
  async getActivities(filters?: Partial<Activity>): Promise<Activity[]> {
    let query = db.select().from(activities);
    
    if (filters) {
      const conditions = [];
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined) {
          conditions.push(eq(activities[key as keyof typeof activities], value));
        }
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(activities.createdAt));
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    const result = await db.select().from(activities).where(eq(activities.id, id));
    return result[0];
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values(insertActivity).returning();
    return result[0];
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | undefined> {
    const result = await db.update(activities)
      .set(updates)
      .where(eq(activities.id, id))
      .returning();
    return result[0];
  }

  async deleteActivity(id: number): Promise<boolean> {
    const result = await db.delete(activities).where(eq(activities.id, id));
    return result.count > 0;
  }

  // Registration methods
  async getRegistrations(filters?: Partial<Registration>): Promise<Registration[]> {
    let query = db.select().from(registrations);
    
    if (filters) {
      const conditions = [];
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined) {
          conditions.push(eq(registrations[key as keyof typeof registrations], value));
        }
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(registrations.createdAt));
  }

  async getRegistration(id: number): Promise<Registration | undefined> {
    const result = await db.select().from(registrations).where(eq(registrations.id, id));
    return result[0];
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const now = new Date();
    const result = await db.insert(registrations)
      .values({
        ...insertRegistration,
        createdAt: now
      })
      .returning();
    return result[0];
  }

  async updateRegistration(id: number, updates: Partial<Registration>): Promise<Registration | undefined> {
    const now = new Date();
    const result = await db.update(registrations)
      .set({
        ...updates,
        updatedAt: now
      })
      .where(eq(registrations.id, id))
      .returning();
    return result[0];
  }

  async deleteRegistration(id: number): Promise<boolean> {
    const result = await db.delete(registrations).where(eq(registrations.id, id));
    return result.count > 0;
  }

  // Complaint methods
  async getComplaints(filters?: Partial<Complaint>): Promise<Complaint[]> {
    let query = db.select().from(complaints);
    
    if (filters) {
      const conditions = [];
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined) {
          conditions.push(eq(complaints[key as keyof typeof complaints], value));
        }
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(complaints.createdAt));
  }

  async getComplaint(id: number): Promise<Complaint | undefined> {
    const result = await db.select().from(complaints).where(eq(complaints.id, id));
    return result[0];
  }

  async createComplaint(insertComplaint: InsertComplaint): Promise<Complaint> {
    const now = new Date();
    const result = await db.insert(complaints)
      .values({
        ...insertComplaint,
        createdAt: now
      })
      .returning();
    return result[0];
  }

  async updateComplaint(id: number, updates: Partial<Complaint>): Promise<Complaint | undefined> {
    const now = new Date();
    const result = await db.update(complaints)
      .set({
        ...updates,
        updatedAt: now
      })
      .where(eq(complaints.id, id))
      .returning();
    return result[0];
  }

  // Notification methods
  async getNotifications(userId: number): Promise<Notification[]> {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications)
      .values(insertNotification)
      .returning();
    return result[0];
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const result = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return result[0];
  }
}