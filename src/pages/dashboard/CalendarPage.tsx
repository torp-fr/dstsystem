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
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'annual'>('monthly');
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
    <div className="p-4 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-bold">Planning</h1>
          <p className="text-xs text-muted-foreground">Calendrier des sessions de tir</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
            <Button
              size="sm"
              variant={viewMode === 'weekly' ? 'default' : 'ghost'}
              className="text-xs"
              onClick={() => setViewMode('weekly')}
            >
              Semaine
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'monthly' ? 'default' : 'ghost'}
              className="text-xs"
              onClick={() => setViewMode('monthly')}
            >
              Mois
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'annual' ? 'default' : 'ghost'}
              className="text-xs"
              onClick={() => setViewMode('annual')}
            >
              Année
            </Button>
          </div>
          <Button size="sm" onClick={() => navigate('/dashboard/sessions/new')} className="gap-1 text-xs">
            <Plus className="h-3 w-3" />
            Session
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                {viewMode === 'annual' ? currentDate.getFullYear() : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              </h2>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={previousMonth} className="h-8 w-8 p-0">
                <ChevronLeft className="h-3 w-3" />
              </Button>
              {!isCurrentMonth && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="text-xs h-8"
                >
                  Aujourd'hui
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          {viewMode === 'monthly' && (
            <>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {dayNames.map((day) => (
                  <div key={day} className="text-center font-semibold text-xs py-1">
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
                        className={`min-h-14 p-1 border-r last:border-r-0 text-xs ${
                          !day.isCurrentMonth ? 'bg-muted/30' : 'bg-card'
                        } ${
                          day.isCurrentMonth &&
                          day.date.toDateString() === today.toDateString()
                            ? 'bg-blue-500/10'
                            : ''
                        }`}
                      >
                        <div
                          className={`text-xs font-semibold mb-0.5 ${
                            !day.isCurrentMonth ? 'text-muted-foreground/50' : 'text-foreground'
                          }`}
                        >
                          {day.date.getDate()}
                        </div>

                        {/* Sessions for this day */}
                        <div className="space-y-0.5">
                          {day.sessions.slice(0, 1).map((session) => (
                            <div
                              key={session.id}
                              onClick={() => navigate(`/dashboard/sessions/${session.id}`)}
                              className="text-xs bg-blue-100 dark:bg-blue-900 p-0.5 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors truncate"
                            >
                              <div className="font-medium truncate text-xs">
                                {session.theme || 'S.'}
                              </div>
                            </div>
                          ))}
                          {day.sessions.length > 1 && (
                            <div className="text-xs text-muted-foreground">+{day.sessions.length - 1}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}

          {viewMode === 'weekly' && (
            <div className="text-center text-muted-foreground py-4">
              Vue hebdomadaire - À venir
            </div>
          )}

          {viewMode === 'annual' && (
            <div className="text-center text-muted-foreground py-4">
              Vue annuelle - À venir
            </div>
          )}

          {/* Legend */}
          <div className="mt-2 p-2 bg-muted/30 rounded-lg border-border border text-xs">
            <p className="text-xs font-semibold mb-1">Statuts:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(statusLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded ${statusColors[key]}`} />
                  <span className="text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
