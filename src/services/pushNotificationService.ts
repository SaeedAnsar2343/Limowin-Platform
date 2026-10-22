import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { triggerHaptic } from '../utils/soundEffects';

export interface PushMessage {
  id: string;
  title: string;
  body: string;
  type: 'deposit' | 'withdrawal' | 'win' | 'promo' | 'support' | 'system';
  timestamp: string;
  read: boolean;
  data?: any;
}

class PushNotificationService {
  private isNative: boolean = false;
  private hasPermission: boolean = false;
  private listenersInitialized: boolean = false;
  private notificationHistory: PushMessage[] = [];
  private onNotificationListeners: ((msg: PushMessage) => void)[] = [];

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    // Load cached notification history
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('limowin_push_history');
        if (saved) {
          this.notificationHistory = JSON.parse(saved);
        }
      }
    } catch {}
  }

  // Initialize and register notification channels & permissions
  public async init() {
    if (this.listenersInitialized) return;
    this.listenersInitialized = true;

    if (this.isNative) {
      try {
        // Request Local & Push notification permissions
        const localStatus = await LocalNotifications.requestPermissions();
        this.hasPermission = localStatus.display === 'granted';

        // Create Android Notification Channels
        await LocalNotifications.createChannel({
          id: 'limowin_vip_alerts',
          name: 'Limowin VIP Transactions & Jackpots',
          description: 'Instant alerts for deposits, withdrawals, big wins, and VIP bonuses',
          importance: 5, // High importance (heads-up banner with sound)
          visibility: 1,
          vibration: true
        });

        // Push notifications listeners
        PushNotifications.addListener('registration', token => {
          console.log('FCM Device Token registered:', token.value);
          localStorage.setItem('limowin_fcm_token', token.value);
        });

        PushNotifications.addListener('registrationError', err => {
          console.warn('FCM registration error:', err);
        });

        PushNotifications.addListener('pushNotificationReceived', notification => {
          this.recordNotification({
            id: notification.id || 'push-' + Date.now(),
            title: notification.title || 'Limowin Alert',
            body: notification.body || '',
            type: (notification.data?.type as any) || 'system',
            timestamp: new Date().toISOString(),
            read: false,
            data: notification.data
          });
        });

        LocalNotifications.addListener('localNotificationReceived', notification => {
          triggerHaptic([30, 50, 40]);
        });
      } catch (err) {
        console.warn('Capacitor native push init error:', err);
      }
    } else {
      // Web Notification API permission check
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          this.hasPermission = true;
        } else if (Notification.permission !== 'denied') {
          try {
            const perm = await Notification.requestPermission();
            this.hasPermission = perm === 'granted';
          } catch {}
        }
      }
    }
  }

  // Subscribe callback to receive real-time notifications in React UI
  public subscribe(listener: (msg: PushMessage) => void) {
    this.onNotificationListeners.push(listener);
    return () => {
      this.onNotificationListeners = this.onNotificationListeners.filter(l => l !== listener);
    };
  }

  // Core trigger method for both Native Android and Web
  public async sendNotification(
    title: string,
    body: string,
    type: PushMessage['type'] = 'system',
    data?: any
  ) {
    const notificationItem: PushMessage = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title,
      body,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      data
    };

    this.recordNotification(notificationItem);
    triggerHaptic([40, 60, 40]);

    // 1. Native Android Local Notification
    if (this.isNative) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 1000000),
              title,
              body,
              channelId: 'limowin_vip_alerts',
              schedule: { at: new Date(Date.now() + 100) },
              sound: 'beep.wav',
              extra: data
            }
          ]
        });
      } catch (err) {
        console.warn('Native notification trigger failed:', err);
      }
    } else {
      // 2. Web Browser Desktop / Mobile notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: '/icon.png',
            badge: '/icon.png'
          });
        } catch {}
      }
    }

    // Broadcast to React in-app toasters and notifications badge
    this.onNotificationListeners.forEach(cb => cb(notificationItem));
  }

  private recordNotification(item: PushMessage) {
    this.notificationHistory = [item, ...this.notificationHistory.slice(0, 49)];
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('limowin_push_history', JSON.stringify(this.notificationHistory));
      }
    } catch {}
  }

  public getHistory(): PushMessage[] {
    return this.notificationHistory;
  }

  public markAllAsRead() {
    this.notificationHistory = this.notificationHistory.map(n => ({ ...n, read: true }));
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('limowin_push_history', JSON.stringify(this.notificationHistory));
      }
    } catch {}
  }

  // ----------------- SPECIFIC ACTIONS -----------------

  public notifyDepositApproved(amount: number, formatted: string) {
    this.sendNotification(
      '💰 Deposit Approved!',
      `Your deposit of ${formatted} has been credited to your Limowin wallet. Good luck!`,
      'deposit',
      { amount }
    );
  }

  public notifyWithdrawalProcessed(amount: number, formatted: string) {
    this.sendNotification(
      '🏦 Withdrawal Processed Successfully!',
      `Payout of ${formatted} has been sent to your bank/crypto wallet rail.`,
      'withdrawal',
      { amount }
    );
  }

  public notifyBigWin(gameTitle: string, formattedAmount: string, multiplier: number) {
    this.sendNotification(
      '🎉 MASSIVE JACKPOT WIN!',
      `You just won ${formattedAmount} (${multiplier.toFixed(2)}x) playing ${gameTitle}!`,
      'win',
      { gameTitle, multiplier }
    );
  }

  public notifyWelcomeBonus(formattedBonus: string) {
    this.sendNotification(
      '🎁 Welcome Bonus Credited!',
      `Your instant bonus of ${formattedBonus} is active! Play 5 games to unlock full withdrawal.`,
      'promo'
    );
  }

  public notifySupportReply(senderName: string, previewText: string) {
    this.sendNotification(
      `💬 Support Message from ${senderName}`,
      previewText,
      'support'
    );
  }

  public notifyPromotionActivated(title: string) {
    this.sendNotification(
      '🔥 VIP Promotion Activated!',
      `Promotion "${title}" is now active on your account.`,
      'promo'
    );
  }
}

export const pushService = new PushNotificationService();
