import { useState, useMemo } from 'react';
import { Bell, AlertCircle, Calendar, FileText, Users, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useNotifications, useNotificationCount } from '@/hooks/useNotifications';
import { Badge } from '@/components/ui/badge';

const NotificationBell = () => {
  const { data: allNotifications = [] } = useNotifications();
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>(() => {
    const stored = localStorage.getItem('dismissed-notifications');
    return stored ? JSON.parse(stored) : [];
  });

  // Filter out dismissed notifications
  const notifications = useMemo(
    () => allNotifications.filter((n) => !dismissedNotifications.includes(n.id)),
    [allNotifications, dismissedNotifications]
  );

  const notificationCount = notifications.filter((n) => !n.read).length;

  const handleDismissNotification = (notificationId: string) => {
    const updated = [...dismissedNotifications, notificationId];
    setDismissedNotifications(updated);
    localStorage.setItem('dismissed-notifications', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    const allIds = notifications.map((n) => n.id);
    setDismissedNotifications([...dismissedNotifications, ...allIds]);
    localStorage.setItem(
      'dismissed-notifications',
      JSON.stringify([...dismissedNotifications, ...allIds])
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'quote':
        return <FileText className="h-4 w-4" />;
      case 'session':
        return <Calendar className="h-4 w-4" />;
      case 'payment':
        return <AlertCircle className="h-4 w-4" />;
      case 'operator':
        return <Users className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-amber-600 dark:text-amber-400';
      case 'low':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive/10';
      case 'medium':
        return 'bg-amber-500/10';
      case 'low':
        return 'bg-secondary/20';
      default:
        return 'bg-secondary/20';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 hover:bg-secondary/30 rounded-lg transition-colors relative">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <div className="absolute top-1 right-1 flex items-center justify-center">
              {notificationCount <= 9 ? (
                <span className="h-5 w-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {notificationCount}
                </span>
              ) : (
                <span className="h-2 w-2 bg-destructive rounded-full" />
              )}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <span className="font-semibold text-sm">Notifications</span>
          <div className="flex items-center gap-2">
            {notificationCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {notificationCount}
              </Badge>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-6 px-2 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Effacer tout
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border border-border/50 hover:bg-secondary/20 transition-colors flex items-start gap-2 group ${getSeverityBgColor(
                    notification.severity
                  )}`}
                >
                  <div className={`mt-0.5 flex-shrink-0 ${getSeverityColor(notification.severity)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {notification.timestamp.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDismissNotification(notification.id)}
                    className="flex-shrink-0 p-1 rounded hover:bg-primary/20 opacity-0 group-hover:opacity-100 transition-all"
                    title="Dismiss notification"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
