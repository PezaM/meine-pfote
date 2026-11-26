export type UserRole = 'board' | 'foster' | 'treasurer' | 'driver';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  board: 'Vorstand',
  foster: 'Pflegestelle',
  treasurer: 'Kassiererin',
  driver: 'Fahrer',
};

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  role: UserRole;
  fosterHomeId?: string;
}
