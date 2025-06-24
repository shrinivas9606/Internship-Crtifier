import { z } from "zod";

// User settings schema for first-time setup
export const userSettingsSchema = z.object({
  uid: z.string(),
  companyName: z.string().min(1, "Company name is required"),
  companyLogo: z.string().url("Invalid logo URL"),
  supervisorName: z.string().min(1, "Supervisor name is required"),
  supervisorSignature: z.string().url("Invalid supervisor signature URL"),
  ceoName: z.string().min(1, "CEO name is required"),
  ceoSignature: z.string().url("Invalid CEO signature URL"),
  selectedTemplate: z.enum(["classic", "modern", "elegant"]),
  setupCompleted: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
});

// Intern schema
export const internSchema = z.object({
  id: z.string(),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").optional(),
  domain: z.string().min(1, "Domain is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  certificateId: z.string(),
  createdBy: z.string(), // user uid
  status: z.enum(["active", "completed"]).default("active"),
  createdAt: z.date().default(() => new Date()),
});

// Certificate verification schema
export const certificateVerificationSchema = z.object({
  certificateId: z.string(),
  internId: z.string(),
  verificationCount: z.number().default(0),
  lastVerified: z.date().default(() => new Date()),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;
export type Intern = z.infer<typeof internSchema>;
export type CertificateVerification = z.infer<typeof certificateVerificationSchema>;

// Insert schemas (omitting auto-generated fields)
export const insertUserSettingsSchema = userSettingsSchema.omit({ 
  createdAt: true 
});

export const insertInternSchema = internSchema.omit({ 
  id: true, 
  certificateId: true, 
  createdAt: true 
});

export const insertCertificateVerificationSchema = certificateVerificationSchema.omit({
  verificationCount: true,
  lastVerified: true
});

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type InsertIntern = z.infer<typeof insertInternSchema>;
export type InsertCertificateVerification = z.infer<typeof insertCertificateVerificationSchema>;
