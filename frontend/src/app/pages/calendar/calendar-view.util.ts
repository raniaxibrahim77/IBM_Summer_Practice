import { MeetingResponse } from '../../services/meeting.service';
import { ActionItemResponse } from '../../services/action-item.service';

export interface CalendarCell {
  day: number;
  muted: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: { id: string; title: string; kind: 'primary' | 'secondary' | 'tertiary' }[];
}

export interface TaskReminder {
  id: string;
  title: string;
  status: string;
  done: boolean;
  tag: string;
}

export interface TimelineItem {
  id: string;
  day: string;
  time: string;
  title: string;
  subtitle: string;
  kind: 'muted' | 'primary' | 'secondary' | 'empty';
}

export function getEventsForDay(
  day: number,
  viewYear: number,
  viewMonth: number,
  meetings: MeetingResponse[],
  actionItems: ActionItemResponse[]
): CalendarCell['events'] {
  const meetingEvents = meetings
    .filter((m) => {
      const d = new Date(m.meetingDatetime);
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth && d.getDate() === day;
    })
    .map((m) => ({ id: m.id, title: m.title, kind: 'primary' as const }));

  const deadlineEvents = actionItems
    .filter((item) => {
      if (!item.deadline) return false;
      const d = new Date(item.deadline);
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth && d.getDate() === day;
    })
    .map((item) => ({ id: item.id, title: item.description, kind: 'tertiary' as const }));

  return [...meetingEvents, ...deadlineEvents];
}

export function buildCalendarCells(
  viewYear: number,
  viewMonth: number,
  today: Date,
  meetings: MeetingResponse[],
  actionItems: ActionItemResponse[]
): CalendarCell[] {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
  const isCurrentRealMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const cells: CalendarCell[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, muted: true, isToday: false, isWeekend: false, events: [] });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const weekdayIndex = (firstWeekday + d - 1) % 7;
    cells.push({
      day: d,
      muted: false,
      isToday: isCurrentRealMonth && d === today.getDate(),
      isWeekend: weekdayIndex === 5 || weekdayIndex === 6,
      events: getEventsForDay(d, viewYear, viewMonth, meetings, actionItems),
    });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0 || cells.length < 42) {
    cells.push({ day: nextDay++, muted: true, isToday: false, isWeekend: false, events: [] });
  }

  return cells;
}

export function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'No deadline';
  const d = new Date(deadline);
  const isToday = d.toDateString() === new Date().toDateString();
  return isToday ? 'Due Today' : `Due ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
}

export function buildTaskReminders(actionItems: ActionItemResponse[]): TaskReminder[] {
  const sorted = [...actionItems].sort((a, b) => {
    const aDone = a.status === 'DONE';
    const bDone = b.status === 'DONE';
    if (aDone !== bDone) return aDone ? 1 : -1;
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return sorted.map((item) => ({
    id: item.id,
    title: item.description,
    status: item.status === 'DONE' ? 'Completed' : formatDeadline(item.deadline),
    done: item.status === 'DONE',
    tag: item.proposedAssignee ?? 'Task',
  }));
}

export function buildTimeline(meetings: MeetingResponse[]): TimelineItem[] {
  const now = new Date();
  const upcoming = meetings.filter((m) => new Date(m.meetingDatetime) > now);

  return upcoming
    .sort((a, b) => new Date(a.meetingDatetime).getTime() - new Date(b.meetingDatetime).getTime())
    .slice(0, 5)
    .map((m, i) => {
      const d = new Date(m.meetingDatetime);
      return {
        id: m.id,
        day: d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
        time: d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        title: m.title,
        subtitle: m.description ?? '',
        kind: i % 2 === 0 ? ('primary' as const) : ('secondary' as const),
      };
    });
}