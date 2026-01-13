
import { Client, Trainer, KAM, TrainingBooking, User, UserRole } from './types';

export const MOCK_CLIENTS: Client[] = [];
export const MOCK_TRAINERS: Trainer[] = [];
export const MOCK_KAMS: KAM[] = [];
export const INITIAL_BOOKINGS: TrainingBooking[] = [];

export const INITIAL_USERS: User[] = [
  {
    id: 'U-001',
    name: 'Super Administrator',
    email: 'admin@tipsoi.com',
    password: '123456', 
    role: UserRole.SUPER_ADMIN,
    avatar: '',
    permissions: ['dashboard', 'mdb', 'ticket', 'bookings', 'reports', 'analytics', 'users', 'settings']
  }
];
