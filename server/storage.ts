import { db } from "./db";
import { userSettingsTable, internsTable, verificationsTable } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Database operations for certificate management
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // PostgreSQL storage for certificate data
  }

  async saveUserSettings(settings: any) {
    await db.insert(userSettingsTable).values(settings);
  }

  async getUserSettings(uid: string) {
    const [user] = await db.select().from(userSettingsTable).where(eq(userSettingsTable.uid, uid));
    return user || null;
  }

  async addIntern(intern: any) {
    await db.insert(internsTable).values(intern);
  }

  async getInternsByUser(uid: string) {
    return await db.select().from(internsTable).where(eq(internsTable.createdBy, uid));
  }

  async getInternByCertificateId(certificateId: string) {
    const [intern] = await db.select().from(internsTable).where(eq(internsTable.certificateId, certificateId));
    return intern || null;
  }

  async addVerification(verification: any) {
    await db.insert(verificationsTable).values(verification);
  }

  async updateVerificationCount(certificateId: string) {
    const [current] = await db.select().from(verificationsTable).where(eq(verificationsTable.certificateId, certificateId));
    if (current) {
      const newCount = (parseInt(current.verificationCount) + 1).toString();
      await db.update(verificationsTable)
        .set({ 
          verificationCount: newCount, 
          lastVerified: new Date() 
        })
        .where(eq(verificationsTable.certificateId, certificateId));
    }
  }
}

export const storage = new DatabaseStorage();
