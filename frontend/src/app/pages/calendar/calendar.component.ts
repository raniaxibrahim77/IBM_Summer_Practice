import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface CalendarCell {
  day: number;
  muted: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: { title: string; kind: 'primary' | 'secondary' | 'tertiary' }[];
}

interface TaskReminder {
  title: string;
  status: string;
  done: boolean;
  tag: string;
}

interface TimelineItem {
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
export class CalendarComponent {
  private today = new Date();
  viewYear = this.today.getFullYear();
  viewMonth = this.today.getMonth();

  readonly weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  cells: CalendarCell[] = [];

  private readonly demoEvents: Record<number, { title: string; kind: 'primary' | 'secondary' | 'tertiary' }[]> = {
    3: [{ title: 'Audit Kickoff', kind: 'tertiary' }],
    8: [
      { title: 'Client Meeting', kind: 'primary' },
      { title: 'Design Review', kind: 'secondary' },
    ],
  };

  taskReminders: TaskReminder[] = [
    { title: 'Prepare Q3 Slides', status: 'Due Today • 4:00 PM', done: false, tag: 'Presentation' },
    { title: 'Send Invite', status: 'Upcoming • Tomorrow', done: false, tag: 'Meetings' },
    { title: 'Review Audit Reports', status: 'Completed', done: true, tag: 'Audit' },
  ];

  readonly timeline: TimelineItem[] = [
    { time: '8:00 AM', title: 'Deep Focus Block', subtitle: 'Solo productivity session', kind: 'muted' },
    { time: '9:00 AM', title: '8 AM Client Meeting', subtitle: '', kind: 'primary' },
    { time: '11:00 AM', title: 'Design Review', subtitle: 'Product team meeting', kind: 'secondary' },
    { time: '2:30 PM', title: 'Available Slot', subtitle: '', kind: 'empty' },
  ];

  constructor() {
    this.buildCalendar();
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
    task.done = !task.done;
    task.status = task.done ? 'Completed' : task.status.replace('Completed', 'Due Today • 4:00 PM');
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
        events: this.demoEvents[d] ?? [],
      });
    }

    let nextDay = 1;
    while (cells.length % 7 !== 0 || cells.length < 42) {
      cells.push({ day: nextDay++, muted: true, isToday: false, isWeekend: false, events: [] });
    }

    this.cells = cells;
  }
}