import { useState, useMemo, useEffect } from 'react';
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
import { getPlanningSessionsSafe } from '@/services/planningBridge.service';
import { useClients } from '@/hooks/useClients';
import { Loader2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-600/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500',
  in_progress: 'bg-amber-600/20 text-amber-700 dark:text-amber-300 border-l-4 border-amber-500',
  completed: 'bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-l-4 border-emerald-500',
  cancelled: 'bg-rose-600/20 text-rose-700 dark:text-rose-300 border-l-4 border-rose-500',
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

interface CalendarPageProps {
  onSessionClick?: (session: any) => void;
}

export default function CalendarPage({ onSessionClick }: CalendarPageProps) {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'annual'>('monthly');
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // Set week start to Monday
  useMemo(() => {
    const date = new Date(currentDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    setCurrentWeekStart(monday);
  }, [currentDate]);

  // Load sessions from planning service
  useEffect(() => {
    const loadSessions = async () => {
      setSessionsLoading(true);
      try {
        const dateFrom = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const dateTo = new Date(year, month, 0).toISOString().split('T')[0];

        const result = await getPlanningSessionsSafe({
          dateFrom,
          dateTo,
        });

        if (result?.success) {
          // Transform sessions to match expected format
          const transformedSessions = (result.sessions || []).map((s: any) => ({
            ...s,
            session_date: s.date,
          }));
          setSessions(transformedSessions);
        }
      } catch (error) {
        console.error('[CalendarPage] Failed to load sessions:', error);
      } finally {
        setSessionsLoading(false);
      }
    };

    loadSessions();
  }, [year, month]);

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

  const previousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
    setCurrentDate(newDate);
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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                {viewMode === 'annual'
                  ? currentDate.getFullYear()
                  : viewMode === 'weekly'
                  ? `Semaine du ${currentWeekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' })}`
                  : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              </h2>
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={viewMode === 'weekly' ? previousWeek : previousMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              {!isCurrentMonth && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentDate(new Date());
                    setCurrentWeekStart(new Date());
                  }}
                  className="text-xs h-8"
                >
                  Aujourd'hui
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={viewMode === 'weekly' ? nextWeek : nextMonth}
                className="h-8 w-8 p-0"
              >
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
                              onClick={() => {
                                if (onSessionClick) {
                                  onSessionClick(session);
                                } else {
                                  navigate(`/dashboard/sessions/${session.id}`);
                                }
                              }}
                              className={`text-xs p-0.5 rounded cursor-pointer transition-all hover:shadow-md ${
                                statusColors[session.status] || 'bg-blue-600/20 text-blue-700 dark:text-blue-300'
                              } truncate`}
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
            <>
              {/* Weekly view - Table format */}
              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }).map((_, dayOffset) => {
                    const weekStart = new Date(currentDate);
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    const dayDate = new Date(weekStart);
                    dayDate.setDate(dayDate.getDate() + dayOffset);
                    const dateStr = dayDate.toISOString().split('T')[0];
                    const daySessions = sessions.filter((s) => s.session_date === dateStr);
                    const isToday = dayDate.toDateString() === today.toDateString();

                    return (
                      <div
                        key={dayOffset}
                        className={`border-2 rounded-lg overflow-hidden ${
                          isToday ? 'border-blue-500 bg-blue-500/5' : 'border-border bg-card'
                        }`}
                      >
                        {/* Day Header */}
                        <div className="bg-muted/50 p-2 text-center border-b border-border">
                          <p className="text-xs font-semibold capitalize">
                            {dayDate.toLocaleDateString('fr-FR', { weekday: 'short' })}
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {dayDate.getDate()}
                          </p>
                        </div>

                        {/* Sessions List */}
                        <div className="p-2 space-y-1 min-h-[200px] overflow-y-auto">
                          {daySessions.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">-</p>
                          ) : (
                            daySessions.map((session) => (
                              <div
                                key={session.id}
                                onClick={() => {
                                  if (onSessionClick) {
                                    onSessionClick(session);
                                  } else {
                                    navigate(`/dashboard/sessions/${session.id}`);
                                  }
                                }}
                                className={`text-xs p-2 rounded cursor-pointer transition-all hover:shadow-md border-l-2 ${
                                  statusColors[session.status] || 'bg-blue-600/20 text-blue-700'
                                }`}
                              >
                                <div className="font-medium truncate">{session.theme || 'Session'}</div>
                                {session.session_time && (
                                  <div className="text-xs opacity-75">{session.session_time}</div>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        {/* Session count badge */}
                        {daySessions.length > 0 && (
                          <div className="text-center text-xs py-1 bg-muted/30 border-t border-border">
                            <span className="font-semibold">{daySessions.length}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {viewMode === 'annual' && (
            <>
              {/* Annual view - Mini calendars with daily indicators */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, monthOffset) => {
                  const monthDate = new Date(currentDate.getFullYear(), monthOffset, 1);
                  const daysInMonth = new Date(currentDate.getFullYear(), monthOffset + 1, 0).getDate();
                  const monthStr = monthDate.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });

                  // Get all sessions for this month
                  const monthSessions = sessions.filter((s) => {
                    const sessionDate = new Date(s.session_date);
                    return (
                      sessionDate.getMonth() === monthOffset &&
                      sessionDate.getFullYear() === currentDate.getFullYear()
                    );
                  });

                  // Group sessions by day
                  const sessionsByDay = monthSessions.reduce((acc: any, session: any) => {
                    const day = new Date(session.session_date).getDate();
                    if (!acc[day]) acc[day] = [];
                    acc[day].push(session);
                    return acc;
                  }, {});

                  return (
                    <div key={monthOffset} className="bg-card border border-border rounded-lg p-3 space-y-2">
                      {/* Month Header */}
                      <p className="font-semibold text-sm capitalize text-center">{monthStr}</p>

                      {/* Day grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
                          const day = dayIndex + 1;
                          const daySessions = sessionsByDay[day] || [];

                          // Get status for this day (prioritize by severity)
                          let dayStatus = null;
                          if (daySessions.some((s: any) => s.status === 'completed')) dayStatus = 'completed';
                          else if (daySessions.some((s: any) => s.status === 'in_progress')) dayStatus = 'in_progress';
                          else if (daySessions.some((s: any) => s.status === 'scheduled')) dayStatus = 'scheduled';
                          else if (daySessions.some((s: any) => s.status === 'cancelled')) dayStatus = 'cancelled';

                          const statusColorMap: Record<string, string> = {
                            scheduled: 'bg-blue-500',
                            in_progress: 'bg-amber-500',
                            completed: 'bg-emerald-500',
                            cancelled: 'bg-rose-500',
                          };

                          return (
                            <div
                              key={day}
                              className="aspect-square flex flex-col items-center justify-center rounded-sm relative group"
                            >
                              <span className="text-xs font-semibold text-foreground">{day}</span>
                              {daySessions.length > 0 && (
                                <>
                                  <div className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${statusColorMap[dayStatus] || 'bg-gray-400'}`}></div>
                                  {daySessions.length > 1 && (
                                    <div className="absolute -top-1 -right-1 bg-muted text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                      {daySessions.length}
                                    </div>
                                  )}
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-popover border border-border rounded p-2 whitespace-nowrap text-xs hidden group-hover:block z-10 shadow-md">
                                    <div className="font-semibold mb-1">{daySessions.length} session{daySessions.length > 1 ? 's' : ''}</div>
                                    {daySessions.map((s: any) => (
                                      <div key={s.id} className="text-muted-foreground truncate max-w-xs">
                                        {s.theme || 'Session'} - {s.status}
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Legend for this month */}
                      {monthSessions.length > 0 && (
                        <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                          <div className="flex items-center gap-1 justify-center">
                            <span className="font-semibold">{monthSessions.length}</span>
                            <span>session{monthSessions.length > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
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
