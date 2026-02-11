import { useQuery } from '@tanstack/react-query';
import { useClients } from './useClients';
import { useQuotes } from './useQuotes';
import { useShootingSessions } from './useShootingSessions';

export interface Notification {
  id: string;
  type: 'quote' | 'payment' | 'session' | 'operator' | 'general';
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: Date;
  read: boolean;
}

export const useNotifications = () => {
  const { data: clients = [] } = useClients();
  const { data: quotes = [] } = useQuotes();
  const { data: sessions = [] } = useShootingSessions();

  return useQuery({
    queryKey: ['notifications', clients.length, quotes.length, sessions.length],
    queryFn: async () => {
      const notifications: Notification[] = [];

      // Check for draft quotes
      const draftQuotes = quotes.filter((q: any) => q.status === 'draft');
      if (draftQuotes.length > 0) {
        notifications.push({
          id: 'draft-quotes',
          type: 'quote',
          title: 'Devis en brouillon',
          message: `${draftQuotes.length} devis à envoyer`,
          severity: 'high',
          timestamp: new Date(),
          read: false,
        });
      }

      // Check for upcoming sessions (next 7 days)
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const upcomingSessions = sessions.filter(
        (s: any) => s.session_date >= today && s.session_date <= nextWeek
      );
      if (upcomingSessions.length > 0) {
        notifications.push({
          id: 'upcoming-sessions',
          type: 'session',
          title: 'Sessions à venir',
          message: `${upcomingSessions.length} session(s) cette semaine`,
          severity: 'medium',
          timestamp: new Date(),
          read: false,
        });
      }

      // Check for clients without active subscriptions
      const clientsWithoutSubscriptions = clients.filter(
        (c: any) => c.status === 'active' && (!c.client_subscriptions || c.client_subscriptions.length === 0)
      );
      if (clientsWithoutSubscriptions.length > 0) {
        notifications.push({
          id: 'clients-no-subscription',
          type: 'payment',
          title: 'Clients sans formule',
          message: `${clientsWithoutSubscriptions.length} client(s) sans abonnement actif`,
          severity: 'medium',
          timestamp: new Date(),
          read: false,
        });
      }

      return notifications;
    },
  });
};

// Get total unread count
export const useNotificationCount = () => {
  const { data: notifications = [] } = useNotifications();
  return notifications.filter((n) => !n.read).length;
};
