import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let authService: AuthService;
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    authService = TestBed.inject(AuthService);
    service = TestBed.inject(NotificationService);
  });

  it('shows all organization notices to the board', () => {
    authService.login('vorstand', 'vorstand');

    expect(service.getNotificationsForCurrentUser()).toHaveLength(7);
    expect(service.getNotificationsForCurrentUser().some((notice) => notice.title.includes('Neuer Beleg'))).toBe(true);
  });

  it('limits fosters to their own animal and task notifications', () => {
    authService.login('pflegestelle', 'pflegestelle');
    const notifications = service.getNotificationsForCurrentUser();

    expect(notifications.map((notice) => notice.category)).toEqual(['Tier', 'Aufgabe']);
    expect(notifications.some((notice) => notice.title.includes('FA-2026'))).toBe(false);
    expect(service.getNotificationForCurrentUser('notice-treasurer-receipt')).toBeNull();
  });

  it('limits the treasurer to financial notifications', () => {
    authService.login('kassierer', 'kassierer');
    const notifications = service.getNotificationsForCurrentUser();

    expect(notifications).toHaveLength(2);
    expect(notifications.every((notice) => notice.category === 'Finanzen')).toBe(true);
    expect(service.getNotificationForCurrentUser('notice-driver-trip-1')).toBeNull();
  });

  it('limits drivers to notices about their assigned trips', () => {
    authService.login('fahrer', 'fahrer');
    const notifications = service.getNotificationsForCurrentUser();

    expect(notifications).toHaveLength(1);
    expect(notifications[0].assignmentId).toBe('trip-1');
    expect(service.getNotificationForCurrentUser('notice-driver-other-trip')).toBeNull();
  });

  it('marks only a visible notification as read and updates the unread count', () => {
    authService.login('fahrer', 'fahrer');
    expect(service.getUnreadCountForCurrentUser()).toBe(1);
    expect(service.markAsRead('notice-driver-trip-1')?.read).toBe(true);
    expect(service.getUnreadCountForCurrentUser()).toBe(0);

    authService.login('pflegestelle', 'pflegestelle');
    expect(service.markAsRead('notice-driver-trip-1')).toBeNull();
  });
});
