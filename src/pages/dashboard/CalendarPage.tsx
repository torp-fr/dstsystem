import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSessionsByMonth } from '@/hooks/useShootingSessions';
import { useClients } from '@/hooks/useClients';
import { Loader2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  scheduled: 'Programmée',
  in_progress: 'En cours',
  completed: 'Complétée',
  cancelled: 'Annulée',
};

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  sessions: any[];
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: sessions = [], isLoading: sessionsLoading } = useSessionsByMonth(year, month);
  const { data: clients = [] } = useClients();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysInPrevMonth = getDaysInMonth(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );

    const days: CalendarDay[] = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        -i
      );
      days.push({
        date,
        isCurrentMonth: false,
        sessions: [],
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dateStr = date.toISOString().split('T')[0];
      const daySessions = sessions.filter((s) => s.session_date === dateStr);

      days.push({
        date,
        isCurrentMonth: true,
        sessions: daySessions,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        sessions: [],
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const getClientName = (clientId: string | null) => {
    if (!clientId) return 'Sans client';
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.first_name} ${client.last_name}` : 'Client inconnu';
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === currentDate.getFullYear() &&
    today.getMonth() === currentDate.getMonth();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  if (sessionsLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Planning des sessions</h1>
          <p className="text-gray-600">Calendrier annuel des sessions de tir</p>
        </div>
        <Button onClick={() => navigate('/dashboard/sessions/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle session
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {!isCurrentMonth && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Aujourd'hui
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={nextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center font-semibold text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="border-border rounded-lg overflow-hidden">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-7 border-t">
                {week.map((day, dayIdx) => (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    className={`min-h-24 p-2 border-r last:border-r-0 ${
                      !day.isCurrentMonth ? 'bg-muted/30' : 'bg-card'
                    } ${
                      day.isCurrentMonth &&
                      day.date.toDateString() === today.toDateString()
                        ? 'bg-blue-500/10'
                        : ''
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold mb-1 ${
                        !day.isCurrentMonth ? 'text-muted-foreground/50' : 'text-foreground'
                      }`}
                    >
                      {day.date.getDate()}
                    </div>

                    {/* Sessions for this day */}
                    <div className="space-y-1">
                      {day.sessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => navigate(`/dashboard/sessions/${session.id}`)}
                          className="text-xs bg-blue-100 p-1 rounded cursor-pointer hover:bg-blue-200 transition-colors truncate"
                        >
                          <div className="font-medium truncate">
                            {session.theme || 'Sans thème'}
                          </div>
                          <div className="text-gray-600 truncate text-xs">
                            {getClientName(session.client_id)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border-border border">
            <p className="text-sm font-semibold mb-3">Statuts des sessions:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(statusLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${statusColors[key]}`} />
                  <span className="text-sm text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming sessions sidebar */}
      {sessions.filter((s) => new Date(s.session_date) >= today).length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Prochaines sessions</CardTitle>
            <CardDescription>
              {sessions.filter((s) => new Date(s.session_date) >= today).length} sessions à venir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions
                .filter((s) => new Date(s.session_date) >= today)
                .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime())
                .slice(0, 5)
                .map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/dashboard/sessions/${session.id}`)}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{session.theme || 'Sans thème'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.session_date).toLocaleDateString('fr-FR')}
                        {session.session_time && ` à ${session.session_time}`}
                      </p>
                      <p className="text-xs text-muted-foreground/75">
                        {getClientName(session.client_id)}
                      </p>
                    </div>
                    <Badge className={statusColors[session.status]}>
                      {statusLabels[session.status]}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
