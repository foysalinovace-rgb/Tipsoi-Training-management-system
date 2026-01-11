
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  KAM = 'KAM',
  TRAINER = 'TRAINER',
  CLIENT = 'CLIENT',
  STAFF = 'STAFF'
}

export enum BookingStatus {
  TODO = 'To Do',
  DONE = 'Done',
  CANCELLED = 'Cancelled',
  REQUESTED = 'Requested',
  APPROVED = 'Approved',
  COMPLETED = 'Completed'
}

export enum TrainingType {
  ONLINE = 'Online',
  ON_SITE = 'On-site',
  HYBRID = 'Hybrid'
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  contact: string;
  address: string;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  expertise: string[];
}

export interface KAM {
  id: string;
  name: string;
  role: string;
  contact: string;
}

export interface TrainingBooking {
  id: string; 
  clientName: string; 
  assignedPerson: string;
  kamName: string; // Added for Reporting
  title: string;
  category: string;
  type: TrainingType;
  package: string; 
  manpowerSubmissionDate: string;
  date: string; 
  startTime: string; 
  duration: number; 
  location: string;
  notes: string;
  status: BookingStatus;
  createdAt: string;
  history: AuditLog[];
}

export interface AuditLog {
  timestamp: string;
  user: string;
  action: string;
  comment?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  permissions: string[]; // Granular module access
}

export interface SystemSettings {
  panelName: string;
  logo: string;
}
