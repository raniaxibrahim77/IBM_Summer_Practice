import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MeetingService, MeetingResponse } from '../../services/meeting.service'; 
import { ActionItemService, ActionItemResponse } from '../../services/action-item.service';

interface CalendarCell {
  day: number;
  muted: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: { id: string; title: string; kind: 'primary' | 'secondary' | 'tertiary' }[];
}

interface TaskReminder {
  id: string;
  title: string;
  status: string;
  done: boolean;
  tag: string;
}

interface TimelineItem {
  id: string;
  day: string;
  time: string;
  title: string;
  subtitle: string;
  kind: 'muted' | 'primary' | 'secondary' | 'empty';
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent implements OnInit {
  private today = new Date();
  viewYear = this.today.getFullYear();
  viewMonth = this.today.getMonth();

  readonly weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  cells: CalendarCell[] = [];

  private meetings: MeetingResponse[] = [];

  taskReminders: TaskReminder[] = [];
  private actionItems: ActionItemResponse[] = [];

  timeline: TimelineItem[] = [];

  constructor(
    private meetingService: MeetingService,
    private actionItemService: ActionItemService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.meetingService.getMeetings().subscribe({
      next: (meetings) => {
        console.log('meetings response received', meetings.length);
        this.meetings = meetings;
        this.buildCalendar();
        this.buildTimeline();
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load meetings', err),
    });

    this.actionItemService.getActionItems().subscribe({
      next: (items) => {
        this.actionItems = items;
        this.buildTaskReminders();
        this.buildCalendar();
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load action items', err),
    });
  }

  get viewMonthLabel(): string {
    return `${MONTH_NAMES[this.viewMonth]} ${this.viewYear}`;
  }

  previousMonth(): void {
    this.viewMonth--;
    if (this.viewMonth < 0) {
      this.viewMonth = 11;
      this.viewYear--;
    }
    this.buildCalendar();
  }

  nextMonth(): void {
    this.viewMonth++;
    if (this.viewMonth > 11) {
      this.viewMonth = 0;
      this.viewYear++;
    }
    this.buildCalendar();
  }

  goToToday(): void {
    this.viewYear = this.today.getFullYear();
    this.viewMonth = this.today.getMonth();
    this.buildCalendar();
  }

  toggleTask(task: TaskReminder): void {
    const newStatus = task.done ? 'OPEN' : 'DONE';
    this.actionItemService.updateStatus(task.id, newStatus).subscribe({
      next: (updated) => {
        task.done = updated.status === 'DONE';
        task.status = task.done ? 'Completed' : this.formatDeadline(updated.deadline);
      },
      error: (err) => console.error('Failed to update task status', err),
    });
  }

  goToMeeting(id: string): void {
    this.router.navigate(['/meeting-details', id]);
  }

  private buildCalendar(): void {
    const firstOfMonth = new Date(this.viewYear, this.viewMonth, 1);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(this.viewYear, this.viewMonth, 0).getDate();
    const isCurrentRealMonth =
      this.viewYear === this.today.getFullYear() && this.viewMonth === this.today.getMonth();

    const cells: CalendarCell[] = [];

    for (let i = firstWeekday - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, muted: true, isToday: false, isWeekend: false, events: [] });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const weekdayIndex = (firstWeekday + d - 1) % 7;
      cells.push({
        day: d,
        muted: false,
        isToday: isCurrentRealMonth && d === this.today.getDate(),
        isWeekend: weekdayIndex === 5 || weekdayIndex === 6,
        events: this.getEventsForDay(d),
      });
    }

    let nextDay = 1;
    while (cells.length % 7 !== 0 || cells.length < 42) {
      cells.push({ day: nextDay++, muted: true, isToday: false, isWeekend: false, events: [] });
    }

    this.cells = cells;
  }

  private getEventsForDay(day: number): { id: string; title: string; kind: 'primary' | 'secondary' | 'tertiary' }[] {
    const meetingEvents = this.meetings
      .filter((m) => {
        const d = new Date(m.meetingDatetime);
        return d.getFullYear() === this.viewYear && d.getMonth() === this.viewMonth && d.getDate() === day;
      })
      .map((m) => ({ id: m.id, title: m.title, kind: 'primary' as const }));

    const deadlineEvents = this.actionItems
      .filter((item) => {
        if (!item.deadline) return false;
        const d = new Date(item.deadline);
        return d.getFullYear() === this.viewYear && d.getMonth() === this.viewMonth && d.getDate() === day;
      })
      .map((item) => ({ id: item.id, title: item.description, kind: 'tertiary' as const }));

    return [...meetingEvents, ...deadlineEvents];
  }

  private buildTaskReminders(): void {
    this.taskReminders = this.actionItems.map((item) => ({
      id: item.id,
      title: item.description,
      status: item.status === 'DONE' ? 'Completed' : this.formatDeadline(item.deadline),
      done: item.status === 'DONE',
      tag: item.proposedAssignee ?? 'Task',
    }));
  }

  private formatDeadline(deadline: string | null): string {
    if (!deadline) return 'No deadline';
    const d = new Date(deadline);
    const isToday = d.toDateString() === new Date().toDateString();
    return isToday ? 'Due Today' : `Due ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
  }

  private buildTimeline(): void {
    const now = new Date();
    const upcoming = this.meetings.filter((m) => new Date(m.meetingDatetime) > now);

    this.timeline = upcoming
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
}