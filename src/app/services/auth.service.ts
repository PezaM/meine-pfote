import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import type { User } from '../models/user';

export type RegistrationDetails = Omit<User, 'id'>;

const USERS: User[] = [
  {
    id: 'user-board',
    firstName: 'Anna',
    lastName: 'Vorstand',
    username: 'vorstand',
    password: 'vorstand',
    email: 'vorstand@meine-pfote.test',
    role: 'board',
  },
  {
    id: 'user-foster',
    firstName: 'Mila',
    lastName: 'Pfote',
    username: 'pflegestelle',
    password: 'pflegestelle',
    email: 'pflegestelle@meine-pfote.test',
    role: 'foster',
    fosterHomeId: 'sonnenhof',
  },
  {
    id: 'user-treasurer',
    firstName: 'Klara',
    lastName: 'Kasse',
    username: 'kassierer',
    password: 'kassierer',
    email: 'kassiererin@meine-pfote.test',
    role: 'treasurer',
  },
  {
    id: 'user-driver',
    firstName: 'David',
    lastName: 'Fahrer',
    username: 'fahrer',
    password: 'fahrer',
    email: 'fahrer@meine-pfote.test',
    role: 'driver',
  },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly currentUserState = signal<User | null>(null);
  private nextUserId = 1;

  login(username: string, password: string): User | null {
    const normalizedUsername = username.trim().toLocaleLowerCase();
    const user = USERS.find(
      (candidate) => candidate.username.toLocaleLowerCase() === normalizedUsername && candidate.password === password,
    );

    this.currentUserState.set(user ?? null);
    return user ?? null;
  }

  logout(): Promise<boolean> {
    this.currentUserState.set(null);
    return this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  register(details: RegistrationDetails): User | null {
    const username = details.username.trim();
    if (this.isUsernameTaken(username)) {
      return null;
    }

    const user: User = {
      ...details,
      id: `user-${Date.now()}-${this.nextUserId++}`,
      firstName: details.firstName.trim(),
      lastName: details.lastName.trim(),
      username,
      email: details.email.trim(),
    };

    USERS.push(user);
    return user;
  }

  getCurrentUser(): User | null {
    return this.currentUserState();
  }

  isLoggedIn(): boolean {
    return this.currentUserState() !== null;
  }

  getUsers(): readonly User[] {
    return USERS;
  }

  isUsernameTaken(username: string): boolean {
    const normalizedUsername = username.trim().toLocaleLowerCase();
    return USERS.some((user) => user.username.toLocaleLowerCase() === normalizedUsername);
  }

  getTestUsers(): readonly User[] {
    return USERS.slice(0, 4);
  }
}
