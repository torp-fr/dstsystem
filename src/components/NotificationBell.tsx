import { useState } from 'react';
import { Bell, AlertCircle, Calendar, FileText, Users } from 'lucide-react';
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
  const { data: notifications = [] } = useNotifications();
  const notificationCount = useNotificationCount();

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

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notificationCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {notificationCount}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

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
                  className={`p-3 rounded-lg border border-border/50 hover:bg-secondary/20 transition-colors ${getSeverityBgColor(
                    notification.severity
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${getSeverityColor(notification.severity)}`}>
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
                  </div>
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
