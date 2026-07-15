import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Task {
  title: string;
  meta: string;
  done: boolean;
  tag: string;
}

interface RecentMeeting {
  title: string;
  date: string;
  attendees: number;
  tag: string;
}

interface UpcomingEvent {
  day: string;
  date: string;
  title: string;
  time: string;
}

interface CalendarDay {
  day: number;
  muted: boolean;
  hasMeeting: boolean;
  isToday: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  tasks: Task[] = [
    { title: 'Review client feedback for Project X', meta: 'Due at 4:00 PM', done: false, tag: 'Project X' },
    { title: 'Draft weekly internal newsletter', meta: 'Completed', done: true, tag: 'Marketing' },
    { title: 'Prepare slides for Stakeholder Meeting', meta: 'Tomorrow at 9:00 AM', done: false, tag: 'Presentation' },
  ];

  readonly recentMeetings: RecentMeeting[] = [
    { title: 'Quarterly Performance Sync', date: 'Jul 2, 2026', attendees: 6, tag: 'Strategy' },
    { title: 'Design Workshop', date: 'Jun 28, 2026', attendees: 4, tag: 'Design' },
    { title: 'Client Onboarding Call', date: 'Jun 25, 2026', attendees: 3, tag: 'Client' },
  ];

  readonly upcomingEvents: UpcomingEvent[] = [
    { day: 'MON', date: '08', title: 'Board Review', time: '09:00 - 10:30 AM' },
    { day: 'TUE', date: '09', title: 'Design Workshop', time: '02:00 - 04:00 PM' },
    { day: 'THU', date: '11', title: 'Client Sync', time: '11:00 - 11:30 AM' },
  ];

  readonly weekdayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  private today = new Date();
  viewYear = this.today.getFullYear();
  viewMonth = this.today.getMonth(); // 0-indexed

  calendarDays: CalendarDay[] = [];

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

  private buildCalendar(): void {
    const firstOfMonth = new Date(this.viewYear, this.viewMonth, 1);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7;

    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(this.viewYear, this.viewMonth, 0).getDate();

    const isCurrentRealMonth =
      this.viewYear === this.today.getFullYear() && this.viewMonth === this.today.getMonth();

    const cells: CalendarDay[] = [];

    for (let i = firstWeekday - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, muted: true, hasMeeting: false, isToday: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        muted: false,
        hasMeeting: false,
        isToday: isCurrentRealMonth && d === this.today.getDate(),
      });
    }

    let nextDay = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ day: nextDay++, muted: true, hasMeeting: false, isToday: false });
    }

    this.calendarDays = cells;
  }

  toggleTaskDone(task: Task): void {
    task.done = !task.done;
    task.meta = task.done ? 'Completed' : task.meta.replace('Completed', 'Due today');
  }
}